'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getDishBySlug } from './actions';
import crypto from 'crypto';

const CART_COOKIE_NAME = 'cart_session';
const CART_MAX_AGE = 60 * 60 * 24; 

// Get cart secret - fallback jika env tidak ada
function getCartSecret() {
  return process.env.CART_SECRET || 'default-cart-secret-please-change-in-production';
}

// Create HMAC signature
function createCartSignature(cartData, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(cartData));
  return hmac.digest('hex');
}

// Verify cart signature
function verifyCartSignature(cartData, signature, secret) {
  try {
    const expectedSignature = createCartSignature(cartData, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// Validate cart item against database
async function validateCartItem(itemData) {
  try {
    const dish = await getDishBySlug(itemData.slug);
    if (!dish || !dish.available) {
      return null;
    }
    
    // Return validated item dengan server-side price
    return {
      id: dish.id,
      slug: dish.slug,
      name: dish.name,
      image: dish.image,
      price: parseFloat(dish.price), // Always use server price
      quantity: Math.min(Math.max(1, parseInt(itemData.quantity)), 99),
      variants: itemData.variants || {},
      addedAt: itemData.addedAt
    };
  } catch (error) {
    console.error('Error validating cart item:', error);
    return null;
  }
}

// Get cart with server-side validation
export async function getCart() {
  try {
    const cookieStore = await cookies();
    const cartCookie = cookieStore.get(CART_COOKIE_NAME);
    
    if (!cartCookie || !cartCookie.value) {
      return { items: [], total: 0, itemCount: 0 };
    }

    // Check if cookie value is empty
    const cookieValue = cartCookie.value.trim();
    if (!cookieValue) {
      await clearCart();
      return { items: [], total: 0, itemCount: 0 };
    }

    let cartData;
    try {
      cartData = JSON.parse(cookieValue);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      await clearCart();
      return { items: [], total: 0, itemCount: 0 };
    }

    // Validate structure
    if (!cartData || typeof cartData !== 'object' || !Array.isArray(cartData.items)) {
      await clearCart();
      return { items: [], total: 0, itemCount: 0 };
    }

    const { items, signature, timestamp } = cartData;
    
    // Check required fields
    if (!signature || !timestamp) {
      await clearCart();
      return { items: [], total: 0, itemCount: 0 };
    }
    
    // Check expiry
    if (Date.now() - timestamp > CART_MAX_AGE * 1000) {
      await clearCart();
      return { items: [], total: 0, itemCount: 0 };
    }

    // Verify signature
    if (!verifyCartSignature({ items, timestamp }, signature, getCartSecret())) {
      console.warn('Cart signature verification failed');
      await clearCart();
      return { items: [], total: 0, itemCount: 0 };
    }

    // Validate each item against database
    const validatedItems = [];
    for (const item of items) {
      const validatedItem = await validateCartItem(item);
      if (validatedItem) {
        validatedItems.push(validatedItem);
      }
    }

    // Calculate totals dengan server prices
    const total = validatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = validatedItems.reduce((sum, item) => sum + item.quantity, 0);

    return { items: validatedItems, total, itemCount };
  } catch (error) {
    console.error('Error getting cart:', error);
    try {
      await clearCart();
    } catch (clearError) {
      console.error('Error clearing cart:', clearError);
    }
    return { items: [], total: 0, itemCount: 0 };
  }
}

// Save cart dengan minimal data
async function saveCart(items) {
  try {
    const cookieStore = await cookies();
    const timestamp = Date.now();
    
    // Store minimal data tanpa prices
    const minimalItems = items.map(item => ({
      id: item.id,
      slug: item.slug,
      quantity: item.quantity,
      variants: item.variants || {},
      addedAt: item.addedAt || Date.now()
    }));
    
    const cartData = { items: minimalItems, timestamp };
    const signature = createCartSignature(cartData, getCartSecret());
    
    const signedCart = {
      items: minimalItems,
      timestamp,
      signature
    };

    cookieStore.set(CART_COOKIE_NAME, JSON.stringify(signedCart), {
      maxAge: CART_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
  } catch (error) {
    console.error('Error saving cart:', error);
    throw new Error('Failed to save cart');
  }
}

// Add item to cart
export async function addToCart(dishSlug, quantity = 1, variants = {}) {
  try {
    // Validate inputs
    if (!dishSlug || quantity < 1 || quantity > 99) {
      return { success: false, message: 'Parameter tidak valid' };
    }

    // Get dish from database
    const dish = await getDishBySlug(dishSlug);
    if (!dish || !dish.available) {
      return { success: false, message: 'Menu tidak tersedia' };
    }

    // Get current cart
    const cart = await getCart();
    const items = [...cart.items];

    // Create cart item
    const cartItem = {
      id: dish.id,
      slug: dish.slug,
      name: dish.name,
      image: dish.image,
      price: parseFloat(dish.price),
      quantity: parseInt(quantity),
      variants: variants || {},
      addedAt: Date.now()
    };

    // Check if item exists
    const existingIndex = items.findIndex(item => 
      item.id === dish.id && 
      JSON.stringify(item.variants) === JSON.stringify(variants)
    );

    if (existingIndex >= 0) {
      items[existingIndex].quantity = Math.min(
        items[existingIndex].quantity + quantity,
        99
      );
    } else {
      if (items.length >= 50) {
        return { success: false, message: 'Keranjang penuh (maksimal 50 item)' };
      }
      items.push(cartItem);
    }

    await saveCart(items);
    revalidatePath('/');
    
    return { success: true, message: 'Item berhasil ditambahkan ke keranjang' };
  } catch (error) {
    console.error('Error adding to cart:', error);
    return { success: false, message: 'Terjadi kesalahan sistem' };
  }
}

// Update cart item quantity
export async function updateCartItem(itemIndex, quantity) {
  try {
    if (quantity < 0 || quantity > 99) {
      return { success: false, message: 'Jumlah tidak valid' };
    }

    const cart = await getCart();
    const items = [...cart.items];

    if (itemIndex < 0 || itemIndex >= items.length) {
      return { success: false, message: 'Item tidak ditemukan' };
    }

    if (quantity === 0) {
      items.splice(itemIndex, 1);
    } else {
      items[itemIndex].quantity = quantity;
    }

    await saveCart(items);
    revalidatePath('/cart');
    
    return { success: true };
  } catch (error) {
    console.error('Error updating cart:', error);
    return { success: false, message: 'Gagal memperbarui keranjang' };
  }
}

// Remove item from cart
export async function removeFromCart(itemIndex) {
  try {
    const cart = await getCart();
    const items = [...cart.items];

    if (itemIndex < 0 || itemIndex >= items.length) {
      return { success: false, message: 'Item tidak ditemukan' };
    }

    items.splice(itemIndex, 1);
    await saveCart(items);
    revalidatePath('/cart');
    
    return { success: true };
  } catch (error) {
    console.error('Error removing from cart:', error);
    return { success: false, message: 'Gagal menghapus item' };
  }
}

// Clear cart
export async function clearCart() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(CART_COOKIE_NAME);
    revalidatePath('/cart');
    
    return { success: true };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return { success: false, message: 'Gagal mengosongkan keranjang' };
  }
}

// Get cart count
export async function getCartCount() {
  try {
    const cart = await getCart();
    return cart.itemCount;
  } catch (error) {
    console.error('Error getting cart count:', error);
    return 0;
  }
}
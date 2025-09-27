'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getCart, getCartCount } from '@/lib/cart-actions';

const CartContext = createContext({
  cart: { items: [], total: 0, itemCount: 0 },
  refreshCart: () => {},
  isLoading: true
});

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], total: 0, itemCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const refreshCart = async () => {
    try {
      const cartData = await getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Error refreshing cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  return (
    <CartContext.Provider value={{ cart, refreshCart, isLoading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
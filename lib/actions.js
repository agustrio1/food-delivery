'use server';

import { db } from '@/db/client';
import { discounts, categories, dishes } from '@/db/schema';
import { eq, and, gte, lte, desc, asc } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Get active discounts
export async function getActiveDiscounts() {
  try {
    const now = new Date();
    
    const activeDiscounts = await db
      .select()
      .from(discounts)
      .where(
        and(
          eq(discounts.is_active, true),
          gte(discounts.expires_at, now),
          lte(discounts.starts_at, now)
        )
      )
      .orderBy(desc(discounts.created_at))
      .limit(3);

    return activeDiscounts;
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return [];
  }
}

// Get categories
export async function getCategories() {
  try {
    const categoriesList = await db
      .select()
      .from(categories)
      .where(eq(categories.is_active, true))
      .orderBy(asc(categories.sort_order), asc(categories.name));

    return categoriesList;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Get dishes with filters
export async function getDishes(options = {}) {
  try {
    const { 
      featured = false, 
      categoryId = null, 
      limit = null,
      available = true 
    } = options;

    let query = db
      .select({
        id: dishes.id,
        name: dishes.name,
        slug: dishes.slug,
        description: dishes.description,
        image: dishes.image,
        price: dishes.price,
        available: dishes.available,
        is_featured: dishes.is_featured,
        preparation_time: dishes.preparation_time,
        category_id: dishes.category_id,
        created_at: dishes.created_at
      })
      .from(dishes);

    // Add conditions
    const conditions = [];
    
    if (available) {
      conditions.push(eq(dishes.available, true));
    }
    
    if (featured) {
      conditions.push(eq(dishes.is_featured, true));
    }
    
    if (categoryId) {
      conditions.push(eq(dishes.category_id, categoryId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Add ordering and limit
    query = query.orderBy(asc(dishes.sort_order), desc(dishes.created_at));
    
    if (limit) {
      query = query.limit(limit);
    }

    const dishesList = await query;
    return dishesList;
  } catch (error) {
    console.error('Error fetching dishes:', error);
    return [];
  }
}

// Get dish by slug
export async function getDishBySlug(slug) {
  try {
    const [dish] = await db
      .select()
      .from(dishes)
      .where(eq(dishes.slug, slug))
      .limit(1);
    
    // Return dish even if not available for detail page
    return dish || null;
  } catch (error) {
    console.error('Error fetching dish by slug:', error);
    return null;
  }
}

// Dismiss discount (store in cookies)
export async function dismissDiscount(discountId) {
  try {
    const cookieStore = await cookies();
    const dismissed = cookieStore.get('dismissed_discounts');
    
    let dismissedList = [];
    if (dismissed) {
      try {
        dismissedList = JSON.parse(dismissed.value);
      } catch (e) {
        dismissedList = [];
      }
    }
    
    if (!dismissedList.includes(discountId)) {
      dismissedList.push(discountId);
    }
    
    cookieStore.set('dismissed_discounts', JSON.stringify(dismissedList), {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: 'lax'
    });
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error dismissing discount:', error);
    return { success: false };
  }
}

// Get dismissed discounts
export async function getDismissedDiscounts() {
  try {
    const cookieStore = await cookies();
    const dismissed = cookieStore.get('dismissed_discounts');
    
    if (!dismissed) {
      return [];
    }
    
    return JSON.parse(dismissed.value);
  } catch (error) {
    console.error('Error getting dismissed discounts:', error);
    return [];
  }
}
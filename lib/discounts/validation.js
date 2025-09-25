import { db } from '@/db/client';
import { discounts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const validateDiscountType = (type) => {
  if (!['percentage', 'fixed_amount'].includes(type)) {
    return 'Invalid discount type. Must be percentage or fixed_amount';
  }
  return null;
};

export const validateDiscountTarget = (target) => {
  if (!['order', 'item', 'category', 'delivery'].includes(target)) {
    return 'Invalid discount target. Must be order, item, category, or delivery';
  }
  return null;
};

export const validateDiscountValue = (value, type) => {
  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue <= 0) {
    return 'Discount value must be a positive number';
  }

  if (type === 'percentage' && numValue > 100) {
    return 'Percentage discount cannot exceed 100%';
  }

  return null;
};

export const validateDiscountDates = (startsAt, expiresAt) => {
  if (startsAt && expiresAt) {
    const startDate = new Date(startsAt);
    const expireDate = new Date(expiresAt);
    
    if (expireDate <= startDate) {
      return 'Expiry date must be after start date';
    }
  }
  return null;
};

export const validateRequiredFields = (body, fields) => {
  for (const field of fields) {
    if (!body[field]) {
      return `Field ${field} is required`;
    }
  }
  return null;
};

export const checkDiscountCodeExists = async (code, excludeId = null) => {
  const query = db
    .select({ id: discounts.id })
    .from(discounts)
    .where(eq(discounts.code, code.toUpperCase()));

  if (excludeId) {
    query.where(and(
      eq(discounts.code, code.toUpperCase()),
      eq(discounts.id, excludeId) === false
    ));
  }

  const existing = await query.limit(1);
  return existing.length > 0;
};
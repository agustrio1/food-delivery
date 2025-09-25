import { db } from '@/db/client';
import { discounts } from '@/db/schema';
import { desc, asc, eq, like, or, and, count } from 'drizzle-orm';

export const buildWhereConditions = (filters) => {
  const { search, active, type, target, expired } = filters;
  let whereConditions = [];

  // Search filter
  if (search) {
    whereConditions.push(
      or(
        like(discounts.name, `%${search}%`),
        like(discounts.code, `%${search}%`),
        like(discounts.description, `%${search}%`)
      )
    );
  }

  // Active filter
  if (active !== null) {
    whereConditions.push(eq(discounts.is_active, active === 'true'));
  }

  // Type filter
  if (type) {
    whereConditions.push(eq(discounts.type, type));
  }

  // Target filter
  if (target) {
    whereConditions.push(eq(discounts.target, target));
  }

  // Expired filter
  if (expired !== null) {
    const now = new Date();
    if (expired === 'true') {
      whereConditions.push(
        and(
          eq(discounts.expires_at, null) === false,
          // Add proper date comparison here
        )
      );
    } else if (expired === 'false') {
      whereConditions.push(
        or(
          eq(discounts.expires_at, null),
          // Add proper date comparison here
        )
      );
    }
  }

  return whereConditions.length > 0 ? and(...whereConditions) : undefined;
};

export const getDiscountsCount = async (whereClause) => {
  const result = await db
    .select({ count: count() })
    .from(discounts)
    .where(whereClause);
    
  return parseInt(result[0]?.count || 0);
};

export const getDiscountsList = async (whereClause, sortBy, sortOrder, limit, offset) => {
  const orderColumn = discounts[sortBy] || discounts.created_at;
  const orderDirection = sortOrder === 'asc' ? asc(orderColumn) : desc(orderColumn);

  return await db
    .select()
    .from(discounts)
    .where(whereClause)
    .orderBy(orderDirection)
    .limit(limit)
    .offset(offset);
};

export const getDiscountById = async (id) => {
  const result = await db
    .select()
    .from(discounts)
    .where(eq(discounts.id, id))
    .limit(1);
    
  return result[0] || null;
};

export const createDiscount = async (discountData) => {
  const result = await db
    .insert(discounts)
    .values(discountData)
    .returning();
    
  return result[0];
};

export const updateDiscount = async (id, updateData) => {
  const result = await db
    .update(discounts)
    .set(updateData)
    .where(eq(discounts.id, id))
    .returning();
    
  return result[0];
};

export const deleteDiscount = async (id) => {
  return await db
    .delete(discounts)
    .where(eq(discounts.id, parseInt(id)));
};
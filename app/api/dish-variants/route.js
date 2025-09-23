import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { dish_variants, dishes } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { withAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dishId = searchParams.get('dish_id');

    let query = db.select().from(dish_variants);

    if (dishId) {
      query = query.where(eq(dish_variants.dish_id, parseInt(dishId)));
    }

    const variants = await query.orderBy(
      dish_variants.dish_id,
      dish_variants.sort_order
    );

    return NextResponse.json({
      success: true,
      data: variants
    });

  } catch (error) {
    console.error('Error fetching dish variants:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dish variants' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();
    const { 
      dish_id, 
      name, 
      type, 
      price_modifier = '0', 
      is_default = false, 
      is_available = true, 
      sort_order = 0 
    } = body;

    if (!dish_id || !name || !type) {
      return NextResponse.json(
        { success: false, error: 'dish_id, name, and type are required' },
        { status: 400 }
      );
    }

    // Jika is_default true, set variant lain jadi false
    if (is_default) {
      await db.update(dish_variants)
        .set({ is_default: false })
        .where(and(
          eq(dish_variants.dish_id, dish_id),
          eq(dish_variants.type, type)
        ));
    }

    const newVariant = await db.insert(dish_variants).values({
      dish_id,
      name,
      type,
      price_modifier,
      is_default,
      is_available,
      sort_order
    }).returning();

    return NextResponse.json({
      success: true,
      data: newVariant[0],
      message: 'Variasi menu berhasil dibuat'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating dish variant:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat variasi menu' },
      { status: 500 }
    );
  }
}, ['admin']);
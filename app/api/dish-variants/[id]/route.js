import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { dish_variants } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { withAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const variant = await db.select()
      .from(dish_variants)
      .where(eq(dish_variants.id, parseInt(id)))
      .limit(1);

    if (variant.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Dish variant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: variant[0]
    });

  } catch (error) {
    console.error('Error fetching dish variant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dish variant' },
      { status: 500 }
    );
  }
}

export const PUT = withAuth(async (request, { params }) => {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const existingVariant = await db.select()
      .from(dish_variants)
      .where(eq(dish_variants.id, parseInt(id)))
      .limit(1);

    if (existingVariant.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Dish variant not found' },
        { status: 404 }
      );
    }

    // Jika mengubah is_default jadi true
    if (body.is_default === true) {
      await db.update(dish_variants)
        .set({ is_default: false })
        .where(and(
          eq(dish_variants.dish_id, existingVariant[0].dish_id),
          eq(dish_variants.type, body.type || existingVariant[0].type)
        ));
    }

    const updateData = {
      ...body,
      updated_at: new Date()
    };

    const updatedVariant = await db.update(dish_variants)
      .set(updateData)
      .where(eq(dish_variants.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedVariant[0],
      message: 'Dish variant updated successfully'
    });

  } catch (error) {
    console.error('Error updating dish variant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update dish variant' },
      { status: 500 }
    );
  }
}, ['admin']);

export const PATCH = PUT;

export const DELETE = withAuth(async (request, { params }) => {
  try {
    const { id } = await params;

    const existingVariant = await db.select()
      .from(dish_variants)
      .where(eq(dish_variants.id, parseInt(id)))
      .limit(1);

    if (existingVariant.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Dish variant not found' },
        { status: 404 }
      );
    }

    await db.delete(dish_variants)
      .where(eq(dish_variants.id, parseInt(id)));

    return NextResponse.json({
      success: true,
      message: 'Dish variant deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting dish variant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete dish variant' },
      { status: 500 }
    );
  }
}, ['admin']);
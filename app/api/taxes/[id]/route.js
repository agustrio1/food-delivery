import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { taxes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { withAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const tax = await db
      .select()
      .from(taxes)
      .where(eq(taxes.id, parseInt(id)))
      .limit(1);

    if (tax.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tax not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: tax[0]
    });

  } catch (error) {
    console.error('Error fetching tax:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tax' },
      { status: 500 }
    );
  }
}

// PUT - Update tax (Admin only)
export const PUT = withAuth(async (request, { params }) => {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingTax = await db
      .select()
      .from(taxes)
      .where(eq(taxes.id, parseInt(id)))
      .limit(1);

    if (existingTax.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tax not found' },
        { status: 404 }
      );
    }

    // Validation for required fields if provided
    if (body.name && !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Tax name cannot be empty' },
        { status: 400 }
      );
    }

    if (body.type && !['percentage', 'fixed_amount'].includes(body.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tax type. Must be percentage or fixed_amount' },
        { status: 400 }
      );
    }

    if (body.value !== undefined) {
      const value = parseFloat(body.value);
      if (isNaN(value) || value < 0) {
        return NextResponse.json(
          { success: false, error: 'Tax value must be a positive number' },
          { status: 400 }
        );
      }

      // For percentage, validate it's not more than 100%
      const taxType = body.type || existingTax[0].type;
      if (taxType === 'percentage' && value > 100) {
        return NextResponse.json(
          { success: false, error: 'Percentage tax cannot exceed 100%' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData = {
      updated_at: new Date()
    };

    // Only update fields that are provided
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.type !== undefined) updateData.type = body.type;
    if (body.value !== undefined) updateData.value = parseFloat(body.value).toString();
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.is_inclusive !== undefined) updateData.is_inclusive = body.is_inclusive;
    if (body.min_order_amount !== undefined) {
      updateData.min_order_amount = body.min_order_amount ? parseFloat(body.min_order_amount).toString() : '0';
    }
    if (body.max_tax_amount !== undefined) {
      updateData.max_tax_amount = body.max_tax_amount ? parseFloat(body.max_tax_amount).toString() : null;
    }
    if (body.applicable_to !== undefined) updateData.applicable_to = body.applicable_to;

    const updatedTax = await db
      .update(taxes)
      .set(updateData)
      .where(eq(taxes.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedTax[0],
      message: 'Tax updated successfully'
    });

  } catch (error) {
    console.error('Error updating tax:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update tax' },
      { status: 500 }
    );
  }
}, ['admin']);

// PATCH - Same as PUT
export const PATCH = PUT;

export const DELETE = withAuth(async (request, { params }) => {
  try {
    const { id } = await params;

    // Check if tax exists
    const existingTax = await db
      .select()
      .from(taxes)
      .where(eq(taxes.id, parseInt(id)))
      .limit(1);

    if (existingTax.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tax not found' },
        { status: 404 }
      );
    }

    // Check if tax is used in any orders (optional - you might want to check order_taxes table)
    // This would require importing order_taxes schema and checking references
    
    await db
      .delete(taxes)
      .where(eq(taxes.id, parseInt(id)));

    return NextResponse.json({
      success: true,
      message: 'Tax deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting tax:', error);
    
    if (error.code === '23503') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete tax as it is being used in orders' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete tax' },
      { status: 500 }
    );
  }
}, ['admin']);

import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { taxes } from '@/db/schema';
import { desc, asc, eq, like, or, and, sql, count } from 'drizzle-orm';
import { withAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const active = searchParams.get('active'); 
    const type = searchParams.get('type'); // 'percentage' or 'fixed_amount'
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const offset = (page - 1) * limit;

    // Build where conditions
    let whereConditions = [];

    // Search filter
    if (search) {
      whereConditions.push(
        or(
          like(taxes.name, `%${search}%`),
          like(taxes.description, `%${search}%`)
        )
      );
    }

    // Active filter
    if (active !== null) {
      whereConditions.push(eq(taxes.is_active, active === 'true'));
    }

    // Type filter
    if (type) {
      whereConditions.push(eq(taxes.type, type));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get total count - Fixed: Using count() function instead of sql
    const totalResult = await db
      .select({ count: count() })
      .from(taxes)
      .where(whereClause);

    const total = parseInt(totalResult[0]?.count || 0);

    // Get taxes with pagination and sorting
    const orderColumn = taxes[sortBy] || taxes.created_at;
    const orderDirection = sortOrder === 'asc' ? asc(orderColumn) : desc(orderColumn);

    const taxesList = await db
      .select()
      .from(taxes)
      .where(whereClause)
      .orderBy(orderDirection)
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: taxesList,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching taxes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch taxes' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();

    const requiredFields = ['name', 'type', 'value'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Field ${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate type
    if (!['percentage', 'fixed_amount'].includes(body.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tax type. Must be percentage or fixed_amount' },
        { status: 400 }
      );
    }

    // Validate value
    const value = parseFloat(body.value);
    if (isNaN(value) || value < 0) {
      return NextResponse.json(
        { success: false, error: 'Tax value must be a positive number' },
        { status: 400 }
      );
    }

    // For percentage, validate it's not more than 100%
    if (body.type === 'percentage' && value > 100) {
      return NextResponse.json(
        { success: false, error: 'Percentage tax cannot exceed 100%' },
        { status: 400 }
      );
    }

    // Prepare tax data
    const taxData = {
      name: body.name.trim(),
      type: body.type,
      value: value.toString(),
      description: body.description?.trim() || null,
      is_active: body.is_active !== false, // Default to true
      is_inclusive: body.is_inclusive || false,
      min_order_amount: body.min_order_amount ? parseFloat(body.min_order_amount).toString() : '0',
      max_tax_amount: body.max_tax_amount ? parseFloat(body.max_tax_amount).toString() : null,
      applicable_to: body.applicable_to || null,
    };

    const newTax = await db
      .insert(taxes)
      .values(taxData)
      .returning();

    return NextResponse.json({
      success: true,
      data: newTax[0],
      message: 'Tax created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating tax:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create tax' },
      { status: 500 }
    );
  }
}, ['admin']);
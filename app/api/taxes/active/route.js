import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { taxes } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

// GET - Fetch only active taxes (for frontend dropdowns, etc.)
export async function GET() {
  try {
    const activeTaxes = await db
      .select()
      .from(taxes)
      .where(eq(taxes.is_active, true))
      .orderBy(asc(taxes.name));

    return NextResponse.json({
      success: true,
      data: activeTaxes
    });

  } catch (error) {
    console.error('Error fetching active taxes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch active taxes' },
      { status: 500 }
    );
  }
}
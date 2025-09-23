import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { categories } from '@/db/schema';
import { eq, asc, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const allCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.is_active, true)) // Only active categories
      .orderBy(asc(categories.sort_order), asc(categories.name));
    
    return NextResponse.json({
      success: true,
      data: allCategories,
      total: allCategories.length
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal mengambil data kategori'
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, sort_order, is_active } = body;

    // Validasi input
    if (!name || name.trim() === '') {
      return NextResponse.json({
        success: false,
        message: 'Nama kategori tidak boleh kosong'
      }, { status: 400 });
    }

    // Cek duplikasi nama kategori
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.name, name.trim()))
      .limit(1);

    if (existingCategory.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Kategori dengan nama ini sudah ada'
      }, { status: 400 });
    }

    const newCategory = await db
      .insert(categories)
      .values({
        name: name.trim(),
        sort_order: sort_order || 0,
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date()
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil ditambahkan',
      data: newCategory[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal menambahkan kategori'
    }, { status: 500 });
  }
}
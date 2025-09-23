import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { categories, dishes } from '@/db/schema';
import { eq, count } from 'drizzle-orm';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Validasi ID
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      return NextResponse.json({
        success: false,
        message: 'ID kategori tidak valid'
      }, { status: 400 });
    }
    
    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (category.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Kategori tidak ditemukan'
      }, { status: 404 });
    }

    // Optional: Hitung jumlah dishes dalam kategori ini
    const dishCount = await db
      .select({ count: count() })
      .from(dishes)
      .where(eq(dishes.category_id, categoryId));

    return NextResponse.json({
      success: true,
      data: {
        ...category[0],
        dish_count: dishCount[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal mengambil data kategori'
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, sort_order, is_active } = body;

    // Validasi ID
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      return NextResponse.json({
        success: false,
        message: 'ID kategori tidak valid'
      }, { status: 400 });
    }

    // Validasi input
    if (!name || name.trim() === '') {
      return NextResponse.json({
        success: false,
        message: 'Nama kategori tidak boleh kosong'
      }, { status: 400 });
    }

    // Cek apakah kategori ada
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Kategori tidak ditemukan'
      }, { status: 404 });
    }

    // Cek duplikasi nama (kecuali kategori yang sedang diupdate)
    const duplicateCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.name, name.trim()))
      .limit(1);

    if (duplicateCategory.length > 0 && duplicateCategory[0].id !== categoryId) {
      return NextResponse.json({
        success: false,
        message: 'Kategori dengan nama ini sudah ada'
      }, { status: 400 });
    }

    // Update kategori
    const updatedCategory = await db
      .update(categories)
      .set({
        name: name.trim(),
        sort_order: sort_order !== undefined ? sort_order : existingCategory[0].sort_order,
        is_active: is_active !== undefined ? is_active : existingCategory[0].is_active,
        updated_at: new Date()
      })
      .where(eq(categories.id, categoryId))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil diperbarui',
      data: updatedCategory[0]
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal memperbarui kategori'
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Validasi ID
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      return NextResponse.json({
        success: false,
        message: 'ID kategori tidak valid'
      }, { status: 400 });
    }

    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Kategori tidak ditemukan'
      }, { status: 404 });
    }

    // Cek apakah ada dishes yang masih menggunakan kategori ini
    const relatedDishes = await db
      .select({ count: count() })
      .from(dishes)
      .where(eq(dishes.category_id, categoryId));

    if (relatedDishes[0]?.count > 0) {
      return NextResponse.json({
        success: false,
        message: `Tidak dapat menghapus kategori. Masih ada ${relatedDishes[0].count} menu yang menggunakan kategori ini.`
      }, { status: 400 });
    }

    // Hapus kategori
    await db
      .delete(categories)
      .where(eq(categories.id, categoryId));

    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal menghapus kategori'
    }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { dishes, categories, dish_variants, order_items } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import slugify from 'slugify';

export async function GET(request, { params }) {
  try {
    // Unwrap params using await
    const { id } = await params;
    
    // Validasi ID
    let dishId;
    if (isNaN(parseInt(id))) {
      // Jika bukan number, anggap sebagai slug
      const dishBySlug = await db
        .select()
        .from(dishes)
        .where(eq(dishes.slug, id))
        .limit(1);

      if (dishBySlug.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'Menu tidak ditemukan'
        }, { status: 404 });
      }
      dishId = dishBySlug[0].id;
    } else {
      dishId = parseInt(id);
    }
    
    // Get dish dengan category info
    const dish = await db
      .select({
        id: dishes.id,
        name: dishes.name,
        slug: dishes.slug,
        description: dishes.description,
        image: dishes.image,
        images: dishes.images,
        price: dishes.price,
        cost_price: dishes.cost_price,
        available: dishes.available,
        is_featured: dishes.is_featured,
        preparation_time: dishes.preparation_time,
        calories: dishes.calories,
        allergens: dishes.allergens,
        ingredients: dishes.ingredients,
        nutritional_info: dishes.nutritional_info,
        category_id: dishes.category_id,
        sort_order: dishes.sort_order,
        created_at: dishes.created_at,
        updated_at: dishes.updated_at,
        category_name: categories.name
      })
      .from(dishes)
      .leftJoin(categories, eq(dishes.category_id, categories.id))
      .where(eq(dishes.id, dishId))
      .limit(1);

    if (dish.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Menu tidak ditemukan'
      }, { status: 404 });
    }

    // Get variants untuk dish ini
    const variants = await db
      .select()
      .from(dish_variants)
      .where(eq(dish_variants.dish_id, dishId))
      .orderBy(dish_variants.sort_order, dish_variants.name);

    // Get order count untuk statistik
    const orderCount = await db
      .select({ count: count() })
      .from(order_items)
      .where(eq(order_items.dish_id, dishId));

    return NextResponse.json({
      success: true,
      data: {
        ...dish[0],
        variants,
        order_count: orderCount[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('Error fetching dish:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal mengambil data menu'
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    // Unwrap params using await
    const { id } = await params;
    const body = await request.json();

    // Validasi ID
    const dishId = parseInt(id);
    if (isNaN(dishId)) {
      return NextResponse.json({
        success: false,
        message: 'ID menu tidak valid'
      }, { status: 400 });
    }

    // Cek apakah dish ada
    const existingDish = await db
      .select()
      .from(dishes)
      .where(eq(dishes.id, dishId))
      .limit(1);

    if (existingDish.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Menu tidak ditemukan'
      }, { status: 404 });
    }

    const {
      name,
      description,
      image,
      images,
      price,
      cost_price,
      available,
      is_featured,
      preparation_time,
      calories,
      allergens,
      ingredients,
      nutritional_info,
      category_id,
      sort_order
    } = body;

    // Validasi input wajib
    if (name && name.trim() === '') {
      return NextResponse.json({
        success: false,
        message: 'Nama menu tidak boleh kosong'
      }, { status: 400 });
    }

    if (price && parseFloat(price) <= 0) {
      return NextResponse.json({
        success: false,
        message: 'Harga menu harus lebih dari 0'
      }, { status: 400 });
    }

    // Generate slug baru jika nama berubah
    let finalSlug = existingDish[0].slug;
    if (name && name.trim() !== existingDish[0].name) {
      let baseSlug = slugify(name.trim(), {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });

      // Cek apakah slug sudah ada (kecuali untuk dish ini sendiri)
      let counter = 1;
      finalSlug = baseSlug;
      
      while (true) {
        const duplicateSlug = await db
          .select({ id: dishes.id })
          .from(dishes)
          .where(eq(dishes.slug, finalSlug))
          .limit(1);

        if (duplicateSlug.length === 0 || duplicateSlug[0].id === dishId) break;
        
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // Validasi category_id jika ada
    if (category_id) {
      const categoryExists = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.id, parseInt(category_id)))
        .limit(1);

      if (categoryExists.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'Kategori tidak ditemukan'
        }, { status: 400 });
      }
    }

    // Prepare update data - hanya update field yang diberikan
    const updateData = {
      updated_at: new Date()
    };

    if (name !== undefined) {
      updateData.name = name.trim();
      updateData.slug = finalSlug;
    }
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (image !== undefined) updateData.image = image || null;
    if (images !== undefined) updateData.images = images || null;
    if (price !== undefined) updateData.price = parseFloat(price).toFixed(2);
    if (cost_price !== undefined) updateData.cost_price = cost_price ? parseFloat(cost_price).toFixed(2) : null;
    if (available !== undefined) updateData.available = available;
    if (is_featured !== undefined) updateData.is_featured = is_featured;
    if (preparation_time !== undefined) updateData.preparation_time = preparation_time;
    if (calories !== undefined) updateData.calories = calories;
    if (allergens !== undefined) updateData.allergens = allergens;
    if (ingredients !== undefined) updateData.ingredients = ingredients;
    if (nutritional_info !== undefined) updateData.nutritional_info = nutritional_info;
    if (category_id !== undefined) updateData.category_id = category_id ? parseInt(category_id) : null;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    // Update dish
    const updatedDish = await db
      .update(dishes)
      .set(updateData)
      .where(eq(dishes.id, dishId))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Menu berhasil diperbarui',
      data: updatedDish[0]
    });
  } catch (error) {
    console.error('Error updating dish:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal memperbarui menu'
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    // Unwrap params using await
    const { id } = await params;

    // Validasi ID
    const dishId = parseInt(id);
    if (isNaN(dishId)) {
      return NextResponse.json({
        success: false,
        message: 'ID menu tidak valid'
      }, { status: 400 });
    }

    // Cek apakah dish ada
    const existingDish = await db
      .select()
      .from(dishes)
      .where(eq(dishes.id, dishId))
      .limit(1);

    if (existingDish.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Menu tidak ditemukan'
      }, { status: 404 });
    }

    // Cek apakah ada order yang masih menggunakan dish ini
    const relatedOrders = await db
      .select({ count: count() })
      .from(order_items)
      .where(eq(order_items.dish_id, dishId));

    if (relatedOrders[0]?.count > 0) {
      return NextResponse.json({
        success: false,
        message: `Tidak dapat menghapus menu. Masih ada ${relatedOrders[0].count} pesanan yang menggunakan menu ini. Sebaiknya nonaktifkan menu saja.`
      }, { status: 400 });
    }

    // Hapus variants terkait terlebih dahulu
    await db
      .delete(dish_variants)
      .where(eq(dish_variants.dish_id, dishId));

    // Hapus dish
    await db
      .delete(dishes)
      .where(eq(dishes.id, dishId));

    return NextResponse.json({
      success: true,
      message: 'Menu berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting dish:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal menghapus menu'
    }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { dishes, categories } from '@/db/schema';
import { eq, asc, desc, and, or, like, sql } from 'drizzle-orm';
import slugify from 'slugify';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category_id = searchParams.get('category_id');
    const search = searchParams.get('search');
    const available = searchParams.get('available');
    const featured = searchParams.get('featured');
    const sort = searchParams.get('sort') || 'name'; // name, price, created_at
    const order = searchParams.get('order') || 'asc'; // asc, desc
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    // Build query conditions
    let conditions = [];
    
    if (category_id) {
      conditions.push(eq(dishes.category_id, parseInt(category_id)));
    }
    
    if (search) {
      conditions.push(
        or(
          like(dishes.name, `%${search}%`),
          like(dishes.description, `%${search}%`)
        )
      );
    }
    
    if (available !== null && available !== undefined) {
      conditions.push(eq(dishes.available, available === 'true'));
    }
    
    if (featured !== null && featured !== undefined) {
      conditions.push(eq(dishes.is_featured, featured === 'true'));
    }

    // Build order clause
    let orderClause;
    const direction = order === 'desc' ? desc : asc;
    
    switch (sort) {
      case 'price':
        orderClause = direction(dishes.price);
        break;
      case 'created_at':
        orderClause = direction(dishes.created_at);
        break;
      case 'sort_order':
        orderClause = [asc(dishes.sort_order), asc(dishes.name)];
        break;
      default:
        orderClause = direction(dishes.name);
    }

    // Execute query with join to categories
    const result = await db
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
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderClause)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalResult = await db
      .select({ count: sql`count(*)` })
      .from(dishes)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = parseInt(totalResult[0].count);

    return NextResponse.json({
      success: true,
      data: result,
      pagination: {
        total,
        limit,
        offset,
        has_next: offset + limit < total,
        has_prev: offset > 0
      }
    });
  } catch (error) {
    console.error('Error fetching dishes:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal mengambil data menu'
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
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
    if (!name || name.trim() === '') {
      return NextResponse.json({
        success: false,
        message: 'Nama menu tidak boleh kosong'
      }, { status: 400 });
    }

    if (!price || parseFloat(price) <= 0) {
      return NextResponse.json({
        success: false,
        message: 'Harga menu harus lebih dari 0'
      }, { status: 400 });
    }

    // Generate slug otomatis dari nama
    let baseSlug = slugify(name.trim(), {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });

    // Cek apakah slug sudah ada, jika ya tambahkan suffix
    let finalSlug = baseSlug;
    let counter = 1;
    
    while (true) {
      const existingDish = await db
        .select({ id: dishes.id })
        .from(dishes)
        .where(eq(dishes.slug, finalSlug))
        .limit(1);

      if (existingDish.length === 0) break;
      
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
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

    // Insert menu baru
    const newDish = await db
      .insert(dishes)
      .values({
        name: name.trim(),
        slug: finalSlug,
        description: description?.trim() || null,
        image: image || null,
        images: images || null,
        price: parseFloat(price).toFixed(2),
        cost_price: cost_price ? parseFloat(cost_price).toFixed(2) : null,
        available: available !== undefined ? available : true,
        is_featured: is_featured !== undefined ? is_featured : false,
        preparation_time: preparation_time || 15,
        calories: calories || null,
        allergens: allergens || null,
        ingredients: ingredients || null,
        nutritional_info: nutritional_info || null,
        category_id: category_id ? parseInt(category_id) : null,
        sort_order: sort_order || 0,
        updated_at: new Date()
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Menu berhasil ditambahkan',
      data: newDish[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating dish:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal menambahkan menu'
    }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { getDishes } from '@/lib/actions';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const featured = searchParams.get('featured') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : null;

    const options = {};
    
    if (categoryId && categoryId !== '') {
      options.categoryId = parseInt(categoryId);
    }
    
    if (featured) {
      options.featured = true;
    }
    
    if (limit) {
      options.limit = limit;
    }

    const dishes = await getDishes(options);
    
    return NextResponse.json(dishes);
  } catch (error) {
    console.error('Error in dishes API:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import {
  validateDiscountType,
  validateDiscountTarget,
  validateDiscountValue,
  validateDiscountDates,
  validateRequiredFields,
  checkDiscountCodeExists
} from './validation';
import {
  buildWhereConditions,
  getDiscountsCount,
  getDiscountsList,
  getDiscountById,
  createDiscount,
  updateDiscount,
  deleteDiscount
} from './queries';
import {
  parseQueryParams,
  transformDiscountData,
  transformUpdateData,
  createPaginationMeta
} from './transformers';

export const handleGetDiscounts = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const params = parseQueryParams(searchParams);
    const { page, limit, search, active, type, target, expired, sortBy, sortOrder } = params;

    const offset = (page - 1) * limit;
    
    // Build filters
    const whereClause = buildWhereConditions({ search, active, type, target, expired });

    // Get total count and discounts
    const total = await getDiscountsCount(whereClause);
    const discountsList = await getDiscountsList(whereClause, sortBy, sortOrder, limit, offset);

    return NextResponse.json({
      success: true,
      data: discountsList,
      meta: createPaginationMeta(total, page, limit)
    });
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch discounts' },
      { status: 500 }
    );
  }
};

export const handleCreateDiscount = async (request) => {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFieldsError = validateRequiredFields(body, ['name', 'type', 'value', 'target']);
    if (requiredFieldsError) {
      return NextResponse.json(
        { success: false, error: requiredFieldsError },
        { status: 400 }
      );
    }

    // Validate type
    const typeError = validateDiscountType(body.type);
    if (typeError) {
      return NextResponse.json(
        { success: false, error: typeError },
        { status: 400 }
      );
    }

    // Validate target
    const targetError = validateDiscountTarget(body.target);
    if (targetError) {
      return NextResponse.json(
        { success: false, error: targetError },
        { status: 400 }
      );
    }

    // Validate value
    const valueError = validateDiscountValue(body.value, body.type);
    if (valueError) {
      return NextResponse.json(
        { success: false, error: valueError },
        { status: 400 }
      );
    }

    // Validate dates
    const dateError = validateDiscountDates(body.starts_at, body.expires_at);
    if (dateError) {
      return NextResponse.json(
        { success: false, error: dateError },
        { status: 400 }
      );
    }

    // Check if code already exists
    if (body.code) {
      const codeExists = await checkDiscountCodeExists(body.code);
      if (codeExists) {
        return NextResponse.json(
          { success: false, error: 'Discount code already exists' },
          { status: 400 }
        );
      }
    }

    // Transform and create discount
    const discountData = transformDiscountData(body);
    const newDiscount = await createDiscount(discountData);

    return NextResponse.json({
      success: true,
      data: newDiscount,
      message: 'Discount created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating discount:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create discount' },
      { status: 500 }
    );
  }
};

export const handleUpdateDiscount = async (request) => {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Discount ID is required' },
        { status: 400 }
      );
    }

    // Check if discount exists
    const existingDiscount = await getDiscountById(id);
    if (!existingDiscount) {
      return NextResponse.json(
        { success: false, error: 'Discount not found' },
        { status: 404 }
      );
    }

    // Validate type if provided
    if (body.type) {
      const typeError = validateDiscountType(body.type);
      if (typeError) {
        return NextResponse.json(
          { success: false, error: typeError },
          { status: 400 }
        );
      }
    }

    // Validate target if provided
    if (body.target) {
      const targetError = validateDiscountTarget(body.target);
      if (targetError) {
        return NextResponse.json(
          { success: false, error: targetError },
          { status: 400 }
        );
      }
    }

    // Validate value if provided
    if (body.value !== undefined) {
      const discountType = body.type || existingDiscount.type;
      const valueError = validateDiscountValue(body.value, discountType);
      if (valueError) {
        return NextResponse.json(
          { success: false, error: valueError },
          { status: 400 }
        );
      }
    }

    // Validate dates if provided
    const startsAt = body.starts_at || existingDiscount.starts_at;
    const expiresAt = body.expires_at || existingDiscount.expires_at;
    const dateError = validateDiscountDates(startsAt, expiresAt);
    if (dateError) {
      return NextResponse.json(
        { success: false, error: dateError },
        { status: 400 }
      );
    }

    // Check if code already exists (if being updated)
    if (body.code && body.code !== existingDiscount.code) {
      const codeExists = await checkDiscountCodeExists(body.code, id);
      if (codeExists) {
        return NextResponse.json(
          { success: false, error: 'Discount code already exists' },
          { status: 400 }
        );
      }
    }

    // Transform and update discount
    const updateData = transformUpdateData(body, existingDiscount);
    const updatedDiscount = await updateDiscount(id, updateData);

    return NextResponse.json({
      success: true,
      data: updatedDiscount,
      message: 'Discount updated successfully'
    });

  } catch (error) {
    console.error('Error updating discount:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update discount' },
      { status: 500 }
    );
  }
};

export const handleDeleteDiscount = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Discount ID is required' },
        { status: 400 }
      );
    }

    // Check if discount exists
    const existingDiscount = await getDiscountById(parseInt(id));
    if (!existingDiscount) {
      return NextResponse.json(
        { success: false, error: 'Discount not found' },
        { status: 404 }
      );
    }

    // Check if discount has been used
    if (existingDiscount.current_uses > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete discount that has been used. Consider deactivating it instead.' },
        { status: 400 }
      );
    }

    // Delete discount
    await deleteDiscount(id);

    return NextResponse.json({
      success: true,
      message: 'Discount deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting discount:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete discount' },
      { status: 500 }
    );
  }
};
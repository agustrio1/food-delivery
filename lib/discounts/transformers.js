export const parseQueryParams = (searchParams) => {
  return {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
    search: searchParams.get('search') || '',
    active: searchParams.get('active'),
    type: searchParams.get('type'),
    target: searchParams.get('target'),
    expired: searchParams.get('expired'),
    sortBy: searchParams.get('sortBy') || 'created_at',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  };
};

export const transformDiscountData = (body) => {
  const value = parseFloat(body.value);
  
  return {
    code: body.code ? body.code.toUpperCase() : null,
    name: body.name.trim(),
    description: body.description?.trim() || null,
    type: body.type,
    value: value.toString(),
    target: body.target,
    target_ids: body.target_ids || null,
    min_order_amount: body.min_order_amount ? parseFloat(body.min_order_amount).toString() : '0',
    max_discount_amount: body.max_discount_amount ? parseFloat(body.max_discount_amount).toString() : null,
    max_uses: body.max_uses || null,
    max_uses_per_user: body.max_uses_per_user || 1,
    current_uses: 0,
    is_active: body.is_active !== false,
    starts_at: body.starts_at ? new Date(body.starts_at) : null,
    expires_at: body.expires_at ? new Date(body.expires_at) : null,
    applicable_to: body.applicable_to || null,
    first_order_only: body.first_order_only || false,
  };
};

export const transformUpdateData = (body, existingDiscount) => {
  const { id, ...updateData } = body;

  // Handle value conversion
  if (updateData.value !== undefined) {
    const value = parseFloat(updateData.value);
    updateData.value = value.toString();
  }

  // Handle date conversions
  if (updateData.starts_at) updateData.starts_at = new Date(updateData.starts_at);
  if (updateData.expires_at) updateData.expires_at = new Date(updateData.expires_at);

  // Handle code conversion
  if (updateData.code) {
    updateData.code = updateData.code.toUpperCase();
  }

  // Process numeric fields
  ['min_order_amount', 'max_discount_amount'].forEach(field => {
    if (updateData[field] !== undefined) {
      updateData[field] = updateData[field] ? parseFloat(updateData[field]).toString() : null;
    }
  });

  // Set updated timestamp
  updateData.updated_at = new Date();

  return updateData;
};

export const createPaginationMeta = (total, page, limit) => {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1
  };
};
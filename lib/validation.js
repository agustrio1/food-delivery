export const validateDishData = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim() === '') {
    errors.push('Nama menu tidak boleh kosong');
  }
  
  if (!data.price || parseFloat(data.price) <= 0) {
    errors.push('Harga menu harus lebih dari 0');
  }
  
  if (data.cost_price && parseFloat(data.cost_price) < 0) {
    errors.push('Harga modal tidak boleh negatif');
  }
  
  if (data.preparation_time && parseInt(data.preparation_time) < 0) {
    errors.push('Waktu persiapan tidak boleh negatif');
  }
  
  if (data.calories && parseInt(data.calories) < 0) {
    errors.push('Kalori tidak boleh negatif');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper untuk format response API
export const formatApiResponse = (success, message, data = null, error = null) => {
  const response = {
    success,
    message
  };
  
  if (data !== null) response.data = data;
  if (error !== null) response.error = error;
  
  return response;
};

// Helper untuk pagination
export const calculatePagination = (total, limit, offset) => {
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;
  
  return {
    total,
    limit,
    offset,
    current_page: currentPage,
    total_pages: totalPages,
    has_next: offset + limit < total,
    has_prev: offset > 0,
    next_offset: offset + limit < total ? offset + limit : null,
    prev_offset: offset > 0 ? Math.max(0, offset - limit) : null
  };
};
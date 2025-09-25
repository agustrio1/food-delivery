import { withAuth } from '@/lib/auth';
import {
  handleGetDiscounts,
  handleCreateDiscount,
  handleUpdateDiscount,
  handleDeleteDiscount
} from '@/lib/discounts/handlers';

// GET - Fetch discounts with pagination, search, and filters
export async function GET(request) {
  return handleGetDiscounts(request);
}

// POST - Create new discount (Admin only)
export const POST = withAuth(handleCreateDiscount, ['admin']);

// PUT - Update discount (Admin only)
export const PUT = withAuth(handleUpdateDiscount, ['admin']);

// DELETE - Delete discount (Admin only)
export const DELETE = withAuth(handleDeleteDiscount, ['admin']);
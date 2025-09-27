'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/cart-provider';
import Link from 'next/link';

export default function CartBadge() {
  const { cart, isLoading } = useCart();

  return (
    <Link href="/cart">
      <Button variant="outline" className="relative">
        <ShoppingCart className="h-5 w-5" />
        {!isLoading && cart.itemCount > 0 && (
          <Badge 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white text-xs"
          >
            {cart.itemCount > 99 ? '99+' : cart.itemCount}
          </Badge>
        )}
      </Button>
    </Link>
  );
}
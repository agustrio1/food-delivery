import { getCart } from '@/lib/cart-actions';
import CartClient from '@/components/cart/cart-client';
import { Metadata } from 'next';

export const metadata = {
  title: 'Keranjang - Restoku | Pesan Makanan Online',
  description: 'Lihat dan kelola item di keranjang belanja Anda. Checkout mudah dan cepat di Restoku.',
  keywords: 'keranjang, cart, checkout, pesan makanan, restoku',
  openGraph: {
    title: 'Keranjang - Restoku',
    description: 'Kelola pesanan Anda dengan mudah di keranjang Restoku',
    url: 'https://restoku.com/cart',
    siteName: 'Restoku',
    type: 'website',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default async function CartPage() {
  const cart = await getCart();

  return (
    <main className="min-h-screen bg-gray-50">
      <CartClient initialCart={cart} />
    </main>
  );
}
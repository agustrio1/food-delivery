import { Suspense } from 'react';
import { getActiveDiscounts, getCategories, getDishes } from '@/lib/actions';
import DiscountBanner from '@/components/home/discount-banner';
import DishesByCategory from '@/components/home/dishes-by-category';
import Hero from '@/components/home/hero';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Restoku - Pesan Makanan Online Terbaik | Food Delivery Cepat & Terpercaya',
  description: 'Pesan makanan favorit Anda di Restoku dengan mudah dan cepat. Pilihan menu terlengkap dari restoran terpercaya dengan pengantaran hingga ke depan pintu.',
  keywords: 'restoku, pesan makanan online, food delivery, restoran online, delivery makanan, pesan makan',
  openGraph: {
    title: 'Restoku - Food Delivery Terpercaya #1 di Indonesia',
    description: 'Nikmati kemudahan pesan makanan online di Restoku. Pilihan menu terlengkap, delivery cepat, dan harga terjangkau.',
    url: 'https://restoku.com',
    siteName: 'Restoku',
    images: [
      {
        url: 'https://restoku.com/images/og-restoku-home.jpg',
        width: 1200,
        height: 630,
        alt: 'Restoku - Food Delivery App Terpercaya Indonesia'
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restoku - Food Delivery Terpercaya #1 di Indonesia',
    description: 'Pesan makanan favorit dengan mudah dan cepat di Restoku.',
    images: ['https://restoku.com/images/twitter-restoku.jpg'],
    creator: '@restoku_id',
    site: '@restoku_id',
  },
  alternates: {
    canonical: 'https://restoku.com',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  authors: [{ name: 'Restoku Team' }],
  category: 'food delivery',
  classification: 'Business',
};

export default async function HomePage() {
  // Fetch data without authentication requirement
  const [discounts, categories, allDishes] = await Promise.all([
    getActiveDiscounts().catch(() => []),
    getCategories().catch(() => []),
    getDishes({ limit: 16 }).catch(() => [])
  ]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-amber-50 to-white md:max-w-[375px] md:mx-auto md:shadow-xl">
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Restoku",
              "description": "Platform food delivery untuk pesan makanan online",
              "url": "https://restoku.com"
            })
          }}
        />

        {/* Hero Section */}
        <section className="relative">
          <Hero />
        </section>

        {/* Discount Banner */}
        {discounts.length > 0 && (
          <section className="-mt-6 relative z-10 pb-4">
            <DiscountBanner discounts={discounts} />
          </section>
        )}

        {/* All Dishes with Category Filter */}
        <section className="py-6 bg-white">
          <div className="px-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Menu Pilihan Restoku
            </h2>
            <p className="text-sm text-gray-600">Jelajahi menu terlengkap dari restoran terpercaya</p>
          </div>
          <DishesByCategory initialDishes={allDishes} categories={categories} />
        </section>
      </div>
    );
}
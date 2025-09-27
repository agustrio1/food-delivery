import { notFound } from 'next/navigation';
import { getDishBySlug, getDishes } from '@/lib/actions';
import MenuDetailClient from '@/components/menu/menu-detail-client';
import { formatCurrency } from '@/lib/utils';

export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    const dish = await getDishBySlug(slug);

    if (!dish) {
      return {
        title: 'Menu Tidak Ditemukan',
        description: 'Menu yang Anda cari tidak tersedia.'
      };
    }

    return {
      title: `${dish.name} - Pesan Online | FoodieExpress`,
      description: dish.description || `Pesan ${dish.name} dengan harga ${formatCurrency(dish.price)}. Siap dalam ${dish.preparation_time} menit.`,
      keywords: `${dish.name}, pesan makanan online, food delivery`,
      openGraph: {
        title: `${dish.name} - FoodieExpress`,
        description: dish.description,
        images: dish.image ? [
          {
            url: dish.image,
            width: 800,
            height: 600,
            alt: dish.name
          }
        ] : [],
        type: 'website',
        siteName: 'FoodieExpress',
        locale: 'id_ID',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${dish.name} - FoodieExpress`,
        description: dish.description,
        images: dish.image ? [dish.image] : [],
      },
      alternates: {
        canonical: `https://foodieexpress.com/menu/${slug}`,
      },
      robots: {
        index: dish.available,
        follow: true,
      }
    };
  } catch (error) {
    // console.error('Error generating metadata:', error);
    return {
      title: 'Menu Tidak Ditemukan',
      description: 'Menu yang Anda cari tidak tersedia.'
    };
  }
}

export default async function MenuDetailPage({ params }) {
  try {
    const { slug } = await params;
    
    const dish = await getDishBySlug(slug);

    if (!dish) {
      // console.log('Dish not found, returning 404');
      notFound();
    }

    // Get related dishes from same category
    let relatedDishes = [];
    if (dish.category_id) {
      try {
        relatedDishes = await getDishes({
          categoryId: dish.category_id,
          limit: 4,
          excludeId: dish.id
        });
      } catch (error) {
        console.error('Error fetching related dishes:', error);
      }
    }

    return (
      <>
        {/* JSON-LD Structured Data for Product */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": dish.name,
              "description": dish.description,
              "image": dish.image,
              "offers": {
                "@type": "Offer",
                "priceCurrency": "IDR",
                "price": dish.price,
                "availability": dish.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                "seller": {
                  "@type": "Organization",
                  "name": "FoodieExpress"
                }
              },
              "brand": {
                "@type": "Brand",
                "name": "FoodieExpress"
              },
              "additionalProperty": dish.preparation_time ? [
                {
                  "@type": "PropertyValue",
                  "name": "Preparation Time",
                  "value": `${dish.preparation_time} minutes`
                }
              ] : []
            })
          }}
        />

        <MenuDetailClient dish={dish} relatedDishes={relatedDishes} />
      </>
    );
  } catch (error) {
    // console.error('Error in MenuDetailPage:', error);
    notFound();
  }
}
'use client';

import { Clock, Star, Utensils } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

export default function DishGrid({ dishes }) {
  if (!dishes.length) {
    return (
      <div className="text-center py-12">
        <div className="mb-4 flex justify-center">
          <div className="bg-gray-100 rounded-full p-6">
            <Utensils className="h-12 w-12 text-gray-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Belum Ada Menu
        </h3>
        <p className="text-gray-600 text-sm">
          Menu sedang dalam persiapan, silakan kembali lagi nanti.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Force Mobile View CSS */}
      <style jsx global>{`
        .dish-grid-container {
          width: 100%;
        }
        
        @media (min-width: 768px) {
          .dish-grid-container {
            max-width: 375px !important;
            margin: 0 auto !important;
          }
        }
      `}</style>
      
      <div className="dish-grid-container">
        {/* Mobile-First Grid - 2 columns only */}
        <div className="grid grid-cols-2 gap-3">
          {dishes.map((dish, index) => (
            <DishCard key={dish.id} dish={dish} priority={index < 4} />
          ))}
        </div>
      </div>
    </>
  );
}

function DishCard({ dish, priority = false }) {
  return (
    <Link href={`/menu/${dish.slug}`} className="group">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100">
        {/* Image Section */}
        <div className="relative aspect-square bg-gradient-to-br from-amber-50 to-orange-50">
          {dish.image ? (
            <Image
              src={dish.image}
              alt={dish.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, 187px"
              priority={priority}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Utensils className="h-8 w-8 text-gray-400" />
            </div>
          )}
          
          {/* Featured Badge */}
          {dish.is_featured && (
            <Badge className="absolute top-2 left-2 bg-amber-500 hover:bg-amber-600 text-white text-xs px-1.5 py-0.5">
              <Star className="h-2.5 w-2.5 mr-0.5 fill-current" />
              <span className="text-xs">Hot</span>
            </Badge>
          )}
          
          {/* Availability Status */}
          {!dish.available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary" className="bg-gray-800 text-white text-xs">
                Habis
              </Badge>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-3">
          {/* Title */}
          <h3 className="font-medium text-gray-900 mb-1 text-sm line-clamp-2 group-hover:text-amber-600 transition-colors leading-tight">
            {dish.name}
          </h3>

          {/* Description - Hidden on small cards for better mobile UX */}
          {dish.description && (
            <p className="text-xs text-gray-500 mb-2 line-clamp-1">
              {dish.description}
            </p>
          )}

          {/* Preparation Time */}
          {dish.preparation_time && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
              <Clock className="h-3 w-3" />
              <span>{dish.preparation_time}m</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-amber-600">
              {formatCurrency(dish.price)}
            </span>
            
            {!dish.available && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5">
                Habis
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
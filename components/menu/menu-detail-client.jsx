'use client';

import { useState, useTransition } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Star, 
  Plus, 
  Minus, 
  Heart, 
  Share2, 
  Utensils,
  Flame,
  AlertTriangle,
  Frown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { addToCart } from '@/lib/cart-actions';
import Link from 'next/link';
import Image from 'next/image';
import DishGrid from '@/components/home/dish-grid';

export default function MenuDetailClient({ dish, relatedDishes = [] }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [isPending, startTransition] = useTransition();

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const calculateTotalPrice = () => {
    let basePrice = parseFloat(dish.price);
    return basePrice * quantity;
  };

  const handleAddToCart = () => {
    if (!dish.available) {
      toast.error('Menu tidak tersedia');
      return;
    }

    startTransition(async () => {
      try {
        const result = await addToCart(dish.slug, quantity, selectedVariants);
        
        if (result.success) {
          toast.success('Berhasil ditambahkan ke keranjang!');
          setQuantity(1);
        } else {
          toast.error(result.message || 'Gagal menambahkan ke keranjang');
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
        toast.error('Terjadi kesalahan, silakan coba lagi');
      }
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: dish.name,
          text: dish.description,
          url: window.location.href
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link berhasil disalin!');
      } catch (error) {
        toast.error('Gagal menyalin link');
      }
    }
  };

  return (
    <>
      {/* Force Mobile View CSS */}
      <style jsx global>{`
        .mobile-container {
          width: 100%;
          min-height: 100vh;
          background: #f9fafb;
        }
        
        @media (min-width: 768px) {
          .mobile-container {
            max-width: 375px !important;
            margin: 0 auto !important;
            border-left: 1px solid #e5e7eb;
            border-right: 1px solid #e5e7eb;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
          }
          
          body {
            background: #e5e7eb;
          }
        }
        
        /* Hide scrollbars for cleaner mobile look */
        .mobile-container::-webkit-scrollbar {
          display: none;
        }
        
        .mobile-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="mobile-container">
        {/* Mobile Header - Fixed */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Kembali</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hover:text-red-500 h-8 w-8 p-0">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare} className="h-8 w-8 p-0">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content - with bottom padding to avoid navbar overlap */}
        <div className="px-4 pb-24">
          
          {/* Hero Image */}
          <div className="aspect-[4/3] bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl overflow-hidden mt-4">
            {dish.image ? (
              <Image
                src={dish.image}
                alt={dish.name}
                width={400}
                height={300}
                className="w-full h-full object-cover"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Utensils className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Title and Basic Info */}
          <div className="mt-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl font-bold text-gray-900 leading-tight flex-1">
                {dish.name}
              </h1>
              {dish.is_featured && (
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white flex-shrink-0">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  <span className="text-xs">Unggulan</span>
                </Badge>
              )}
            </div>
            
            {/* Price */}
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(dish.price)}
            </div>

            {dish.description && (
              <p className="text-gray-600 leading-relaxed text-sm">
                {dish.description}
              </p>
            )}
            
            {/* Quick Info */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {dish.preparation_time && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{dish.preparation_time} menit</span>
                </div>
              )}
              
              {dish.calories && (
                <div className="flex items-center gap-1">
                  <Flame className="h-3 w-3" />
                  <span>{dish.calories} kalori</span>
                </div>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Ingredients */}
          {dish.ingredients && dish.ingredients.length > 0 && (
            <div className="space-y-2 mb-4">
              <h3 className="font-medium text-gray-900 text-sm">Bahan-bahan</h3>
              <div className="flex flex-wrap gap-1">
                {dish.ingredients.map((ingredient, index) => (
                  <Badge key={index} variant="outline" className="bg-gray-50 text-xs px-2 py-1">
                    {ingredient}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Allergens */}
          {dish.allergens && dish.allergens.length > 0 && (
            <div className="space-y-2 mb-4">
              <h3 className="font-medium text-gray-900 text-sm">Alergen</h3>
              <div className="flex flex-wrap gap-1">
                {dish.allergens.map((allergen, index) => (
                  <Badge key={index} variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 text-xs px-2 py-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {allergen}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Nutritional Info */}
          {dish.nutritional_info && Object.keys(dish.nutritional_info).length > 0 && (
            <div className="space-y-2 mb-4">
              <h3 className="font-medium text-gray-900 text-sm">Informasi Nutrisi</h3>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="space-y-1">
                  {Object.entries(dish.nutritional_info).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Additional Images */}
          {dish.images && dish.images.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 text-sm mb-2">Foto Lainnya</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {dish.images.slice(0, 5).map((image, index) => (
                  <div key={index} className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={image}
                      alt={`${dish.name} ${index + 1}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Add to Cart Section - Inline */}
          {dish.available ? (
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-6">
              <div className="space-y-4">
                {/* Quantity Selector */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">Jumlah</h3>
                    <p className="text-xs text-gray-500">Pilih jumlah yang diinginkan</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="h-9 w-9 rounded-full p-0 border-2"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="w-12 text-center">
                      <span className="text-lg font-bold text-gray-900">{quantity}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= 99}
                      className="h-9 w-9 rounded-full p-0 border-2"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Total Price and Add Button */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Total Harga</div>
                    <div className="text-xl font-bold text-amber-600">
                      {formatCurrency(calculateTotalPrice())}
                    </div>
                  </div>
                  
                  <Button
                    className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-6 py-3 rounded-xl h-auto"
                    onClick={handleAddToCart}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        <span>Menambah...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        <span>Tambah ke Keranjang</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center mb-6">
              <Frown className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <h3 className="font-medium text-gray-900 mb-2">Menu Tidak Tersedia</h3>
              <p className="text-sm text-gray-600">Menu ini sedang tidak tersedia saat ini</p>
            </div>
          )}

          {/* Related Dishes */}
          {relatedDishes.length > 0 && (
            <div className="mt-8">
              <h2 className="font-bold text-gray-900 mb-4 text-lg">
                Menu Serupa
              </h2>
              <DishGrid dishes={relatedDishes} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
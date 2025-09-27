'use client';

import { useState, useTransition } from 'react';
import { X, Percent, Clock, Gift, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dismissDiscount } from '@/lib/actions';
import { formatCurrency } from '@/lib/utils';

export default function DiscountBanner({ discounts }) {
  const [visibleDiscounts, setVisibleDiscounts] = useState(discounts);
  const [isPending, startTransition] = useTransition();
  const [copiedDiscounts, setCopiedDiscounts] = useState(new Set());

  const handleDismiss = (discountId) => {
    // Optimistically update UI
    setVisibleDiscounts(prev => prev.filter(d => d.id !== discountId));
    
    // Server action
    startTransition(async () => {
      await dismissDiscount(discountId);
    });
  };

  const handleCopyCode = async (discount) => {
    if (!discount.code) return;
    
    try {
      await navigator.clipboard.writeText(discount.code);
      setCopiedDiscounts(prev => new Set(prev).add(discount.id));
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedDiscounts(prev => {
          const newSet = new Set(prev);
          newSet.delete(discount.id);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = discount.code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopiedDiscounts(prev => new Set(prev).add(discount.id));
      setTimeout(() => {
        setCopiedDiscounts(prev => {
          const newSet = new Set(prev);
          newSet.delete(discount.id);
          return newSet;
        });
      }, 2000);
    }
  };

  const formatDiscountValue = (discount) => {
    if (discount.type === 'percentage') {
      return `${discount.value}%`;
    } else {
      return formatCurrency(discount.value);
    }
  };

  const getDiscountIcon = (target) => {
    switch (target) {
      case 'delivery':
        return <Clock className="h-4 w-4" />;
      case 'order':
        return <Gift className="h-4 w-4" />;
      default:
        return <Percent className="h-4 w-4" />;
    }
  };

  if (!visibleDiscounts.length) {
    return null;
  }

  return (
    <>
      {/* Force Mobile View CSS */}
      <style jsx global>{`
        .discount-container {
          width: 100%;
        }
        
        @media (min-width: 768px) {
          .discount-container {
            max-width: 375px !important;
            margin: 0 auto !important;
          }
        }
      `}</style>

      <div className="discount-container px-4">
        <div className="space-y-3">
          {visibleDiscounts.map((discount) => (
            <div
              key={discount.id}
              className="relative bg-gradient-to-r from-amber-400 to-amber-600 rounded-lg p-4 shadow-md overflow-hidden"
            >
              {/* Simple Background Pattern */}
              <div className="absolute inset-0 bg-black/5" />
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
              
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-white/20 rounded-lg p-1.5">
                      {getDiscountIcon(discount.target)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-bold text-sm truncate">
                        {discount.name}
                      </h3>
                      <div className="text-white/90 text-xs">
                        Hemat {formatDiscountValue(discount)}
                        {discount.min_order_amount > 0 && (
                          <span className="ml-1">
                            • Min. {formatCurrency(discount.min_order_amount)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {discount.description && (
                    <p className="text-white/90 text-xs mb-2 line-clamp-2">
                      {discount.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {discount.code && (
                        <div 
                          className="bg-white/20 rounded px-2 py-1 cursor-pointer hover:bg-white/30 transition-colors"
                          onClick={() => handleCopyCode(discount)}
                          title="Klik untuk menyalin kode"
                        >
                          <span className="text-white font-mono font-bold text-xs">
                            {discount.code}
                          </span>
                        </div>
                      )}
                      
                      {discount.code ? (
                        <Button
                          size="sm"
                          className={`${
                            copiedDiscounts.has(discount.id)
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : 'bg-white/90 hover:bg-white text-amber-600'
                          } font-medium text-xs px-3 py-1 h-auto transition-all duration-200 flex items-center gap-1`}
                          onClick={() => handleCopyCode(discount)}
                          disabled={copiedDiscounts.has(discount.id)}
                        >
                          {copiedDiscounts.has(discount.id) ? (
                            <>
                              <Check className="h-3 w-3" />
                              Tersalin!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Salin Kode
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-white/90 hover:bg-white text-amber-600 font-medium text-xs px-3 py-1 h-auto"
                        >
                          Gunakan
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {discount.expires_at && (
                    <div className="flex items-center gap-1 text-white/80 text-xs mt-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        Berlaku hingga {new Date(discount.expires_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10 p-1 h-auto flex-shrink-0"
                  onClick={() => handleDismiss(discount.id)}
                  disabled={isPending}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
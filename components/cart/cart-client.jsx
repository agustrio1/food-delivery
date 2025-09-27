'use client';

import { useState, useTransition } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { updateCartItem, removeFromCart, clearCart } from '@/lib/cart-actions';
import Link from 'next/link';
import Image from 'next/image';

export default function CartClient({ initialCart }) {
  const [cart, setCart] = useState(initialCart);
  const [isPending, startTransition] = useTransition();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 0 || newQuantity > 99) return;

    startTransition(async () => {
      try {
        const result = await updateCartItem(index, newQuantity);
        
        if (result.success) {
          if (newQuantity === 0) {
            const updatedItems = cart.items.filter((_, i) => i !== index);
            setCart(prevCart => ({
              ...prevCart,
              items: updatedItems,
              total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
              itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
            }));
            toast.success('Item dihapus dari keranjang');
          } else {
            const updatedItems = [...cart.items];
            updatedItems[index].quantity = newQuantity;
            setCart(prevCart => ({
              ...prevCart,
              items: updatedItems,
              total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
              itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
            }));
            toast.success('Jumlah berhasil diperbarui');
          }
        } else {
          toast.error(result.message || 'Gagal memperbarui keranjang');
        }
      } catch (error) {
        toast.error('Terjadi kesalahan');
      }
    });
  };

  const removeItem = (index) => {
    startTransition(async () => {
      try {
        const result = await removeFromCart(index);
        
        if (result.success) {
          const updatedItems = cart.items.filter((_, i) => i !== index);
          setCart(prevCart => ({
            ...prevCart,
            items: updatedItems,
            total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
          }));
          toast.success('Item dihapus dari keranjang');
        } else {
          toast.error(result.message || 'Gagal menghapus item');
        }
      } catch (error) {
        toast.error('Terjadi kesalahan');
      }
    });
  };

  const handleClearCart = () => {
    startTransition(async () => {
      try {
        const result = await clearCart();
        
        if (result.success) {
          setCart({ items: [], total: 0, itemCount: 0 });
          setIsAlertOpen(false);
          toast.success('Keranjang berhasil dikosongkan');
        } else {
          toast.error('Gagal mengosongkan keranjang');
        }
      } catch (error) {
        toast.error('Terjadi kesalahan');
      }
    });
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      toast.error('Keranjang kosong');
      return;
    }

    if (!user) {
      toast.info('Silakan login untuk melanjutkan checkout');
      router.push('/login?redirect=/checkout');
      return;
    }

    router.push('/checkout');
  };

  return (
    <>
      {/* Mobile View CSS */}
      <style jsx global>{`
        .mobile-cart-container {
          width: 100%;
          min-height: 100vh;
          background: #f9fafb;
        }
        
        @media (min-width: 768px) {
          .mobile-cart-container {
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
      `}</style>

      <div className="mobile-cart-container">
        {/* Header - Fixed */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Kembali</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900">Keranjang</h1>
              {cart.itemCount > 0 && (
                <div className="bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {cart.itemCount}
                </div>
              )}
            </div>

            {cart.items.length > 0 && (
              <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost" 
                    size="sm"
                    disabled={isPending}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md mx-4 rounded-xl">
                  <AlertDialogHeader className="text-left">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-red-100 p-2 rounded-full">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <AlertDialogTitle className="text-lg font-bold text-gray-900">
                        Kosongkan Keranjang
                      </AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-gray-600 leading-relaxed">
                      Apakah Anda yakin ingin menghapus semua item dari keranjang? 
                      <span className="font-medium text-gray-900"> {cart.itemCount} item</span> akan dihapus dan tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  
                  {/* Show cart summary in dialog */}
                  <div className="bg-gray-50 rounded-lg p-3 my-3">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total item:</span>
                        <span className="font-medium">{cart.itemCount} item</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total nilai:</span>
                        <span className="font-bold text-amber-600">{formatCurrency(cart.total)}</span>
                      </div>
                    </div>
                  </div>

                  <AlertDialogFooter className="gap-3">
                    <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-0">
                      Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearCart}
                      disabled={isPending}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      {isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          <span>Menghapus...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          <span>Ya, Kosongkan</span>
                        </div>
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Content - with bottom padding for navbar */}
        <div className="px-4 pb-32">
          {cart.items.length === 0 ? (
            /* Empty Cart State */
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <ShoppingBag className="h-20 w-20 text-gray-300 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Keranjang Kosong</h2>
              <p className="text-gray-600 mb-6 max-w-sm">
                Belum ada item di keranjang Anda. Yuk mulai pesan makanan favorit!
              </p>
              <Link href="/">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl">
                  Mulai Belanja
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="mt-4 space-y-4">
                {cart.items.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex gap-3">
                      {/* Item Image */}
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ShoppingBag className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2">
                            {item.name}
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            disabled={isPending}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1 h-auto ml-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Variants */}
                        {Object.keys(item.variants).length > 0 && (
                          <div className="space-y-1">
                            {Object.entries(item.variants).map(([key, value]) => (
                              <div key={key} className="text-xs text-gray-500">
                                {key}: {value}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Price and Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-bold text-amber-600">
                            {formatCurrency(item.price * item.quantity)}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(index, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isPending}
                              className="h-7 w-7 rounded-full p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <div className="w-8 text-center">
                              <span className="text-sm font-medium text-gray-900">{item.quantity}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(index, item.quantity + 1)}
                              disabled={item.quantity >= 99 || isPending}
                              className="h-7 w-7 rounded-full p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">Ringkasan Pesanan</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({cart.itemCount} item)</span>
                    <span className="text-gray-900">{formatCurrency(cart.total)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Biaya Layanan</span>
                    <span className="text-gray-900">Gratis</span>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-amber-600 text-lg">{formatCurrency(cart.total)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="mt-6 space-y-3">
                {!user && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <span className="text-blue-900 font-medium">Login diperlukan</span>
                        <p className="text-blue-700 mt-1">Silakan login untuk melanjutkan ke checkout</p>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl h-auto"
                  onClick={handleCheckout}
                  disabled={isPending || cart.items.length === 0}
                >
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Memproses...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      <span>
                        {user ? 'Lanjut ke Checkout' : 'Login & Checkout'}
                      </span>
                      <span className="text-amber-100">•</span>
                      <span>{formatCurrency(cart.total)}</span>
                    </div>
                  )}
                </Button>

                {user && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-green-900 text-sm font-medium">
                        Siap untuk checkout sebagai {user.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
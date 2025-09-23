"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  Star,
  Clock,
  DollarSign,
  ShoppingCart,
  Info,
  Utensils,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Package
} from 'lucide-react';
import { toast } from 'sonner';
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
} from "@/components/ui/alert-dialog";

export default function DishDetailPage({ params }) {
  const router = useRouter();
  const { id: dishId } = use(params);
  
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchDish = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/dishes/${dishId}`);
        const result = await response.json();
        
        if (result.success) {
          setDish(result.data);
        } else {
          toast.error(result.message || 'Menu tidak ditemukan');
          router.push('/dashboard/dishes');
        }
      } catch (error) {
        console.error('Error fetching dish:', error);
        toast.error('Terjadi kesalahan saat memuat data');
        router.push('/dashboard/dishes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDish();
  }, [dishId, router]);

  const handleToggleAvailability = async () => {
    if (!dish) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`/api/dishes/${dishId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          available: !dish.available
        }),
      });

      const result = await response.json();

      if (result.success) {
        setDish(prev => ({ ...prev, available: !prev.available }));
        toast.success(`Menu berhasil ${!dish.available ? 'diaktifkan' : 'dinonaktifkan'}`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Terjadi kesalahan saat mengubah status');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleFeatured = async () => {
    if (!dish) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`/api/dishes/${dishId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_featured: !dish.is_featured
        }),
      });

      const result = await response.json();

      if (result.success) {
        setDish(prev => ({ ...prev, is_featured: !prev.is_featured }));
        toast.success(`Menu berhasil ${!dish.is_featured ? 'ditambahkan ke' : 'dihapus dari'} unggulan`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast.error('Terjadi kesalahan saat mengubah status unggulan');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!dish) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/dishes/${dishId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        router.push('/dashboard/dishes');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error deleting dish:', error);
      toast.error('Terjadi kesalahan saat menghapus menu');
    } finally {
      setDeleting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(dateString));
  };

  const calculateProfit = () => {
    if (!dish.cost_price || !dish.price) return null;
    const profit = parseFloat(dish.price) - parseFloat(dish.cost_price);
    const profitPercentage = (profit / parseFloat(dish.cost_price)) * 100;
    return { profit, profitPercentage };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat data menu...</p>
        </div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Menu Tidak Ditemukan</h2>
          <p className="text-muted-foreground mb-4">Menu yang Anda cari tidak ditemukan atau telah dihapus</p>
          <Button onClick={() => router.push('/dashboard/dishes')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Daftar Menu
          </Button>
        </div>
      </div>
    );
  }

  const profitData = calculateProfit();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="flex  items-center gap-4">
          <Button 
            variant="link" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <div className="mb-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {dish.name}
              {dish.is_featured && <Star className="h-5 w-5 text-yellow-500 fill-current" />}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={dish.available ? "default" : "secondary"}>
                {dish.available ? "Tersedia" : "Tidak Tersedia"}
              </Badge>
              {dish.category_name && (
                <Badge variant="outline">{dish.category_name}</Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleAvailability}
            disabled={updating}
            className="flex items-center gap-2"
          >
            {dish.available ? (
              <>
                <EyeOff className="h-4 w-4" />
                Nonaktifkan
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Aktifkan
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleFeatured}
            disabled={updating}
            className="flex items-center gap-2"
          >
            <Star className={`h-4 w-4 ${dish.is_featured ? 'fill-current text-yellow-500' : ''}`} />
            {dish.is_featured ? 'Batal Unggulan' : 'Jadikan Unggulan'}
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push(`/dashboard/dishes/${dishId}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Hapus
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Menu</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus menu "{dish.name}"? 
                  Tindakan ini tidak dapat dibatalkan.
                  {dish.order_count > 0 && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                      <strong>Peringatan:</strong> Menu ini memiliki {dish.order_count} riwayat pesanan. 
                      Sebaiknya nonaktifkan menu saja daripada menghapusnya.
                    </div>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleting ? "Menghapus..." : "Hapus Menu"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image and Basic Info */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {dish.image ? (
                    <img 
                      src={dish.image} 
                      alt={dish.name}
                      className="w-full h-64 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Utensils className="h-12 w-12 mx-auto mb-2" />
                        <p>Tidak ada gambar</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Informasi Dasar</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Harga Jual:</span>
                        <span className="font-semibold text-green-600">{formatPrice(dish.price)}</span>
                      </div>
                      
                      {dish.cost_price && (
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Harga Modal:</span>
                          <span className="font-medium">{formatPrice(dish.cost_price)}</span>
                        </div>
                      )}
                      
                      {profitData && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Profit:</span>
                          <span className="font-medium text-blue-600">
                            {formatPrice(profitData.profit)} ({profitData.profitPercentage.toFixed(1)}%)
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Waktu Persiapan:</span>
                        <span className="font-medium">{dish.preparation_time || 15} menit</span>
                      </div>
                      
                      {dish.calories && (
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Kalori:</span>
                          <span className="font-medium">{dish.calories} kal</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {dish.description && (
                    <div>
                      <h4 className="font-medium mb-2">Deskripsi</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {dish.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ingredients and Allergens */}
          {(dish.ingredients?.length > 0 || dish.allergens?.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Bahan & Alergen</CardTitle>
                <CardDescription>
                  Informasi bahan-bahan dan alergen dalam menu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dish.ingredients?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-green-700">Bahan-bahan</h4>
                    <div className="flex flex-wrap gap-2">
                      {dish.ingredients.map((ingredient, index) => (
                        <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {dish.allergens?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-yellow-700 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Alergen
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {dish.allergens.map((allergen, index) => (
                        <Badge key={index} variant="destructive" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          {allergen}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Variants */}
          {dish.variants?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Variasi Menu</CardTitle>
                <CardDescription>
                  Pilihan variasi yang tersedia untuk menu ini
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dish.variants.map((variant) => (
                    <div key={variant.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{variant.name}</h4>
                        {variant.description && (
                          <p className="text-sm text-muted-foreground">{variant.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          +{formatPrice(variant.price_adjustment)}
                        </div>
                        <Badge variant={variant.available ? "default" : "secondary"} className="text-xs">
                          {variant.available ? "Tersedia" : "Tidak Tersedia"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Statistik Penjualan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{dish.order_count || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Pesanan</div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge variant={dish.available ? "default" : "secondary"}>
                      {dish.available ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Featured:</span>
                    <Badge variant={dish.is_featured ? "default" : "outline"}>
                      {dish.is_featured ? "Ya" : "Tidak"}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Urutan:</span>
                    <span className="font-medium">{dish.sort_order || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informasi Sistem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">ID Menu:</span>
                  <div className="font-mono font-medium">{dish.id}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Slug:</span>
                  <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{dish.slug}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Dibuat:</span>
                  <div className="font-medium">{formatDate(dish.created_at)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Diperbarui:</span>
                  <div className="font-medium">{formatDate(dish.updated_at)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push(`/dashboard/dishes/${dishId}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Menu
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleToggleAvailability}
                disabled={updating}
              >
                {dish.available ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Nonaktifkan Menu
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Aktifkan Menu
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleToggleFeatured}
                disabled={updating}
              >
                <Star className={`h-4 w-4 mr-2 ${dish.is_featured ? 'fill-current text-yellow-500' : ''}`} />
                {dish.is_featured ? 'Batal Unggulan' : 'Jadikan Unggulan'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
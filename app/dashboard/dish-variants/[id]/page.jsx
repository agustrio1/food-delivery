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
  DollarSign,
  ShoppingCart,
  Info,
  Utensils,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Package,
  Hash,
  Filter,
  BarChart3
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

export default function DishVariantDetailPage({ params }) {
  const router = useRouter();
  const { id: variantId } = use(params);
  
  const [variant, setVariant] = useState(null);
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchVariant = async () => {
      try {
        setLoading(true);
        // Fetch variant data
        const variantResponse = await fetch(`/api/dish-variants/${variantId}`);
        const variantResult = await variantResponse.json();
        
        if (!variantResult.success) {
          toast.error(variantResult.error || 'Varian tidak ditemukan');
          router.push('/dashboard/dish-variants');
          return;
        }

        setVariant(variantResult.data);

        // Fetch dish data berdasarkan dish_id
        if (variantResult.data.dish_id) {
          const dishResponse = await fetch(`/api/dishes/${variantResult.data.dish_id}`);
          const dishResult = await dishResponse.json();
          
          if (dishResult.success) {
            setDish(dishResult.data);
          }
        }
      } catch (error) {
        console.error('Error fetching variant:', error);
        toast.error('Terjadi kesalahan saat memuat data');
        router.push('/dashboard/dish-variants');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVariant();
  }, [variantId, router]);

  const handleToggleAvailability = async () => {
    if (!variant) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`/api/dish-variants/${variantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_available: !variant.is_available
        }),
      });

      const result = await response.json();

      if (result.success) {
        setVariant(prev => ({ ...prev, is_available: !prev.is_available }));
        toast.success(`Varian berhasil ${!variant.is_available ? 'diaktifkan' : 'dinonaktifkan'}`);
      } else {
        toast.error(result.error || result.message);
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Terjadi kesalahan saat mengubah status');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleDefault = async () => {
    if (!variant) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`/api/dish-variants/${variantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_default: !variant.is_default
        }),
      });

      const result = await response.json();

      if (result.success) {
        setVariant(prev => ({ ...prev, is_default: !prev.is_default }));
        toast.success(`Varian berhasil ${!variant.is_default ? 'dijadikan' : 'dibatalkan sebagai'} default`);
      } else {
        toast.error(result.error || result.message);
      }
    } catch (error) {
      console.error('Error updating default status:', error);
      toast.error('Terjadi kesalahan saat mengubah status default');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!variant) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/dish-variants/${variantId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || 'Varian berhasil dihapus');
        router.push('/dashboard/dish-variants');
      } else {
        toast.error(result.error || result.message);
      }
    } catch (error) {
      console.error('Error deleting variant:', error);
      toast.error('Terjadi kesalahan saat menghapus varian');
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

  const getVariantTypeLabel = (type) => {
    const typeMap = {
      'size': 'Ukuran',
      'flavor': 'Rasa',
      'spice_level': 'Level Pedas',
      'protein': 'Protein',
      'add_on': 'Tambahan'
    };
    return typeMap[type] || type;
  };

  const getFinalPrice = () => {
    if (!dish || !variant) return 0;
    return parseFloat(dish.price) + parseFloat(variant.price_modifier || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat data varian...</p>
        </div>
      </div>
    );
  }

  if (!variant) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Varian Tidak Ditemukan</h2>
          <p className="text-muted-foreground mb-4">Varian yang Anda cari tidak ditemukan atau telah dihapus</p>
          <Button onClick={() => router.push('/dashboard/dish-variants')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Daftar Varian
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button 
            variant="link" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {variant.name}
              {variant.is_default && <Star className="h-5 w-5 text-yellow-500 fill-current" />}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={variant.is_available ? "default" : "secondary"}>
                {variant.is_available ? "Tersedia" : "Tidak Tersedia"}
              </Badge>
              <Badge variant="outline">
                {getVariantTypeLabel(variant.type)}
              </Badge>
              {dish && (
                <Badge variant="outline" className="text-xs">
                  {dish.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleAvailability}
            disabled={updating}
            className="flex items-center gap-2"
          >
            {variant.is_available ? (
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
            onClick={handleToggleDefault}
            disabled={updating}
            className="flex items-center gap-2"
          >
            <Star className={`h-4 w-4 ${variant.is_default ? 'fill-current text-yellow-500' : ''}`} />
            {variant.is_default ? 'Batal Default' : 'Set Default'}
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push(`/dashboard/dish-variants/${variantId}/edit`)}
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
                <AlertDialogTitle>Hapus Varian</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus varian "{variant.name}"? 
                  Tindakan ini tidak dapat dibatalkan.
                  {variant.is_default && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                      <strong>Peringatan:</strong> Ini adalah varian default. 
                      Setelah dihapus, pastikan untuk mengatur varian lain sebagai default.
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
                  {deleting ? "Menghapus..." : "Hapus Varian"}
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
          {/* Variant Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Informasi Varian
              </CardTitle>
              <CardDescription>
                Detail lengkap varian menu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Detail Varian</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="text-sm text-muted-foreground">Nama Varian:</span>
                          <div className="font-semibold">{variant.name}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="text-sm text-muted-foreground">Tipe Varian:</span>
                          <div className="font-medium">{getVariantTypeLabel(variant.type)}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="text-sm text-muted-foreground">Urutan:</span>
                          <div className="font-medium">{variant.sort_order || 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Informasi Harga</h3>
                    <div className="space-y-3">
                      {dish && (
                        <div className="flex items-center gap-3">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <span className="text-sm text-muted-foreground">Harga Dasar:</span>
                            <div className="font-medium">{formatPrice(dish.price)}</div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="text-sm text-muted-foreground">Modifier Harga:</span>
                          <div className={`font-medium ${
                            parseFloat(variant.price_modifier || 0) > 0 ? 'text-green-600' : 
                            parseFloat(variant.price_modifier || 0) < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {parseFloat(variant.price_modifier || 0) > 0 ? '+' : ''}
                            {formatPrice(variant.price_modifier || 0)}
                          </div>
                        </div>
                      </div>
                      
                      {dish && (
                        <div className="flex items-center gap-3">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <span className="text-sm text-muted-foreground">Harga Final:</span>
                            <div className="font-semibold text-green-600 text-lg">
                              {formatPrice(getFinalPrice())}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menu Information */}
          {dish && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Informasi Menu Induk
                </CardTitle>
                <CardDescription>
                  Menu yang terkait dengan varian ini
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{dish.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {dish.category_name && (
                        <Badge variant="outline" className="text-xs">
                          {dish.category_name}
                        </Badge>
                      )}
                      <Badge variant={dish.available ? "default" : "secondary"} className="text-xs">
                        {dish.available ? "Tersedia" : "Tidak Tersedia"}
                      </Badge>
                    </div>
                    {dish.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {dish.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      {formatPrice(dish.price)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => router.push(`/dashboard/dishes/${dish.id}`)}
                    >
                      Lihat Detail
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Status Varian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${variant.is_available ? 'text-green-600' : 'text-red-600'}`}>
                    {variant.is_available ? 'AKTIF' : 'NONAKTIF'}
                  </div>
                  <div className="text-sm text-muted-foreground">Status Ketersediaan</div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tersedia:</span>
                    <Badge variant={variant.is_available ? "default" : "secondary"}>
                      {variant.is_available ? "Ya" : "Tidak"}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Default:</span>
                    <Badge variant={variant.is_default ? "default" : "outline"}>
                      {variant.is_default ? "Ya" : "Tidak"}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tipe:</span>
                    <span className="font-medium">{getVariantTypeLabel(variant.type)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Urutan:</span>
                    <span className="font-medium">{variant.sort_order || 0}</span>
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
                  <span className="text-muted-foreground">ID Varian:</span>
                  <div className="font-mono font-medium">{variant.id}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">ID Menu:</span>
                  <div className="font-mono font-medium">{variant.dish_id}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Dibuat:</span>
                  <div className="font-medium">{formatDate(variant.created_at)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Diperbarui:</span>
                  <div className="font-medium">{formatDate(variant.updated_at)}</div>
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
                onClick={() => router.push(`/dashboard/dish-variants/${variantId}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Varian
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleToggleAvailability}
                disabled={updating}
              >
                {variant.is_available ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Nonaktifkan Varian
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Aktifkan Varian
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleToggleDefault}
                disabled={updating}
              >
                <Star className={`h-4 w-4 mr-2 ${variant.is_default ? 'fill-current text-yellow-500' : ''}`} />
                {variant.is_default ? 'Batal Default' : 'Set Default'}
              </Button>

              {dish && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push(`/dashboard/dishes/${dish.id}`)}
                >
                  <Utensils className="h-4 w-4 mr-2" />
                  Lihat Menu Induk
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
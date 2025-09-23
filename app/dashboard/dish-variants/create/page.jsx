"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Loader2,
  DollarSign,
  Settings,
  Star,
  Package,
  Info,
  Check,
  ChevronsUpDown,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function CreateDishVariantPage() {
  const router = useRouter();
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dishSelectOpen, setDishSelectOpen] = useState(false);

  const [formData, setFormData] = useState({
    dish_id: '',
    name: '',
    type: '',
    price_modifier: '0',
    is_default: false,
    is_available: true,
    sort_order: 0
  });

  // Fetch dishes untuk dropdown
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const response = await fetch('/api/dishes?available=true');
        const result = await response.json();
        
        if (result.success) {
          setDishes(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching dishes:', error);
      }
    };

    fetchDishes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.dish_id) {
      toast.error('Menu harus dipilih');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Nama varian wajib diisi');
      return;
    }

    if (!formData.type) {
      toast.error('Tipe varian harus dipilih');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        dish_id: parseInt(formData.dish_id),
        price_modifier: parseFloat(formData.price_modifier) || 0,
        sort_order: parseInt(formData.sort_order) || 0,
      };

      const response = await fetch('/api/dish-variants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        router.push('/dashboard/dish-variants');
      } else {
        toast.error(result.message || 'Gagal menyimpan varian');
      }
    } catch (error) {
      console.error('Error creating dish variant:', error);
      toast.error('Terjadi kesalahan saat menyimpan varian');
    } finally {
      setLoading(false);
    }
  };

  const selectedDish = dishes.find(d => d.id === parseInt(formData.dish_id));

  const variantTypes = [
    { value: 'size', label: 'Ukuran', description: 'Contoh: Small, Medium, Large' },
    { value: 'flavor', label: 'Rasa', description: 'Contoh: Original, Spicy, Sweet' },
    { value: 'spice_level', label: 'Level Pedas', description: 'Contoh: Tidak Pedas, Pedas, Extra Pedas' },
    { value: 'protein', label: 'Protein', description: 'Contoh: Ayam, Sapi, Ikan' },
    { value: 'add_on', label: 'Tambahan', description: 'Contoh: Extra Keju, Extra Sauce' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Tambah Varian Menu</h1>
          <p className="text-muted-foreground">
            Tambahkan varian baru untuk menu yang sudah ada
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Informasi Varian
                </CardTitle>
                <CardDescription>
                  Informasi dasar tentang varian menu yang akan ditambahkan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="dish_id">Menu *</Label>
                  <Popover open={dishSelectOpen} onOpenChange={setDishSelectOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={dishSelectOpen}
                        className="w-full justify-between"
                      >
                        {formData.dish_id
                          ? dishes.find((dish) => dish.id.toString() === formData.dish_id)?.name
                          : "Pilih menu..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput 
                          placeholder="Cari menu..." 
                          className="h-9"
                        />
                        <CommandEmpty className="py-6 text-center text-sm">
                          <div className="flex flex-col items-center gap-2">
                            <Search className="h-8 w-8 text-muted-foreground/50" />
                            <p>Tidak ada menu yang ditemukan.</p>
                            <p className="text-xs text-muted-foreground">
                              Coba gunakan kata kunci lain
                            </p>
                          </div>
                        </CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-auto">
                          {dishes.map((dish) => (
                            <CommandItem
                              key={dish.id}
                              value={`${dish.name} ${dish.category?.name || ''}`}
                              onSelect={() => {
                                setFormData({...formData, dish_id: dish.id.toString()});
                                setDishSelectOpen(false);
                              }}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <Check
                                    className={cn(
                                      "h-4 w-4",
                                      formData.dish_id === dish.id.toString()
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span className="font-medium">{dish.name}</span>
                                    {dish.category?.name && (
                                      <span className="text-xs text-muted-foreground">
                                        {dish.category.name}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-sm font-medium">
                                    {formatCurrency(dish.price)}
                                  </span>
                                  {!dish.is_available && (
                                    <div className="text-xs text-red-500">
                                      Tidak tersedia
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {selectedDish && (
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{selectedDish.name}</p>
                          {selectedDish.category?.name && (
                            <p className="text-sm text-muted-foreground">
                              Kategori: {selectedDish.category.name}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Harga dasar:</p>
                          <p className="font-medium">{formatCurrency(selectedDish.price)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nama Varian *</Label>
                    <Input
                      id="name"
                      placeholder="Contoh: Large, Extra Pedas, Keju"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Tipe Varian *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe" />
                      </SelectTrigger>
                      <SelectContent>
                        {variantTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-muted-foreground">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="sort_order">Urutan Tampil</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({...formData, sort_order: e.target.value})}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Urutan tampil varian dalam grup tipe yang sama
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Price Modifier */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Modifier Harga
                </CardTitle>
                <CardDescription>
                  Penambahan atau pengurangan harga dari harga dasar menu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="price_modifier">Modifier Harga</Label>
                  <div className="relative">
                    <Input
                      id="price_modifier"
                      type="number"
                      placeholder="0"
                      step="1000"
                      value={formData.price_modifier}
                      onChange={(e) => setFormData({...formData, price_modifier: e.target.value})}
                      className="pl-12"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      Rp
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground space-y-1">
                    <p>• Nilai positif = menambah harga (contoh: +5000)</p>
                    <p>• Nilai negatif = mengurangi harga (contoh: -2000)</p>
                    <p>• Nilai 0 = tidak mengubah harga dasar</p>
                    {selectedDish && (
                      <div className="mt-2 p-2 bg-muted rounded-md">
                        <p className="font-medium">Harga Final:</p>
                        <p className="text-lg">
                          {formatCurrency(parseFloat(selectedDish.price) + parseFloat(formData.price_modifier || 0))}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Pengaturan
                </CardTitle>
                <CardDescription>
                  Status dan pengaturan varian
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Varian Tersedia</Label>
                    <p className="text-sm text-muted-foreground">
                      Varian dapat dipilih pelanggan
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_available}
                    onCheckedChange={(checked) => setFormData({...formData, is_available: checked})}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Varian Default
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Terpilih otomatis saat pesan
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_default}
                    onCheckedChange={(checked) => setFormData({...formData, is_default: checked})}
                  />
                </div>
                
                {formData.is_default && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex">
                      <Info className="h-4 w-4 text-yellow-600 mt-0.5 mr-2" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">Varian Default</p>
                        <p>Varian ini akan terpilih otomatis. Varian default lainnya dengan tipe yang sama akan diubah menjadi tidak default.</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Variant Type Info */}
            {formData.type && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Info Tipe Varian</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p className="font-medium mb-1">
                      {variantTypes.find(t => t.value === formData.type)?.label}
                    </p>
                    <p className="text-muted-foreground">
                      {variantTypes.find(t => t.value === formData.type)?.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Button 
                    type="submit" 
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan Varian'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.back()}
                    disabled={loading}
                  >
                    Batal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
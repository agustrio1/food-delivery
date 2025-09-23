"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Loader2,
  ImageIcon,
  DollarSign,
  Clock,
  Utensils,
  Info,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

export default function CreateDishPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    price: '',
    cost_price: '',
    category_id: '',
    available: true,
    is_featured: false,
    preparation_time: 15,
    calories: '',
    allergens: [],
    ingredients: [],
    sort_order: 0
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [allergenInput, setAllergenInput] = useState('');
  const [ingredientInput, setIngredientInput] = useState('');

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const result = await response.json();
        
        if (result.success) {
          setCategories(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleImageUpload = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    setUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('fileName', formData.name || 'dish-image');
      formDataUpload.append('folder', '/dishes');

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formDataUpload,
      });

      const result = await response.json();

      if (result.success) {
        setFormData(prev => ({ ...prev, image: result.data.url }));
        setImagePreview(result.data.url);
        toast.success('Gambar berhasil diupload');
      } else {
        toast.error(result.message || 'Gagal mengupload gambar');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Terjadi kesalahan saat mengupload gambar');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addAllergen = () => {
    if (allergenInput.trim() && !formData.allergens.includes(allergenInput.trim())) {
      setFormData(prev => ({
        ...prev,
        allergens: [...prev.allergens, allergenInput.trim()]
      }));
      setAllergenInput('');
    }
  };

  const removeAllergen = (allergen) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.filter(a => a !== allergen)
    }));
  };

  const addIngredient = () => {
    if (ingredientInput.trim() && !formData.ingredients.includes(ingredientInput.trim())) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, ingredientInput.trim()]
      }));
      setIngredientInput('');
    }
  };

  const removeIngredient = (ingredient) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(i => i !== ingredient)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Nama menu wajib diisi');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Harga menu harus lebih dari 0');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        category_id: formData.category_id || null,
        preparation_time: parseInt(formData.preparation_time) || 15,
        calories: formData.calories ? parseInt(formData.calories) : null,
        sort_order: parseInt(formData.sort_order) || 0,
        allergens: formData.allergens.length > 0 ? formData.allergens : null,
        ingredients: formData.ingredients.length > 0 ? formData.ingredients : null,
      };

      const response = await fetch('/api/dishes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        router.push('/dashboard/dishes');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error creating dish:', error);
      toast.error('Terjadi kesalahan saat menyimpan menu');
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-2xl font-bold">Tambah Menu Baru</h1>
          <p className="text-muted-foreground">
            Tambahkan menu makanan atau minuman baru ke dalam sistem
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
                  <Utensils className="h-5 w-5" />
                  Informasi Dasar
                </CardTitle>
                <CardDescription>
                  Informasi utama tentang menu yang akan ditambahkan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="name">Nama Menu *</Label>
                    <Input
                      id="name"
                      placeholder="Contoh: Nasi Goreng Spesial"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Kategori</Label>
                    <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Perbaikan: Mengubah value="" menjadi value="null" */}
                        <SelectItem value="null">Tanpa kategori</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    placeholder="Deskripsi menu, bahan-bahan, atau informasi khusus lainnya"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Harga
                </CardTitle>
                <CardDescription>
                  Atur harga jual dan harga modal menu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Harga Jual *</Label>
                    <div className="relative">
                      <Input
                        id="price"
                        type="number"
                        placeholder="0"
                        min="0"
                        step="1000"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        required
                        className="pl-12"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        Rp
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="cost_price">Harga Modal</Label>
                    <div className="relative">
                      <Input
                        id="cost_price"
                        type="number"
                        placeholder="0"
                        min="0"
                        step="1000"
                        value={formData.cost_price}
                        onChange={(e) => setFormData({...formData, cost_price: e.target.value})}
                        className="pl-12"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        Rp
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Untuk perhitungan profit (opsional)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Informasi Tambahan
                </CardTitle>
                <CardDescription>
                  Informasi nutrisi dan detail lainnya
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preparation_time" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Waktu Persiapan (menit)
                    </Label>
                    <Input
                      id="preparation_time"
                      type="number"
                      placeholder="15"
                      min="1"
                      value={formData.preparation_time}
                      onChange={(e) => setFormData({...formData, preparation_time: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="calories">Kalori</Label>
                    <Input
                      id="calories"
                      type="number"
                      placeholder="0"
                      min="0"
                      value={formData.calories}
                      onChange={(e) => setFormData({...formData, calories: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label>Alergen</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Tambah alergen (contoh: Kacang, Susu, Telur)"
                      value={allergenInput}
                      onChange={(e) => setAllergenInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergen())}
                    />
                    <Button type="button" onClick={addAllergen} variant="outline">
                      Tambah
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.allergens.map((allergen, index) => (
                      <div key={index} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-sm flex items-center gap-1">
                        {allergen}
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="sm" 
                          className="h-4 w-4 p-0 hover:bg-yellow-200" 
                          onClick={() => removeAllergen(allergen)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Bahan-bahan</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Tambah bahan (contoh: Nasi, Ayam, Sayuran)"
                      value={ingredientInput}
                      onChange={(e) => setIngredientInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                    />
                    <Button type="button" onClick={addIngredient} variant="outline">
                      Tambah
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.ingredients.map((ingredient, index) => (
                      <div key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm flex items-center gap-1">
                        {ingredient}
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="sm" 
                          className="h-4 w-4 p-0 hover:bg-green-200" 
                          onClick={() => removeIngredient(ingredient)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Gambar Menu
                </CardTitle>
                <CardDescription>
                  Upload foto menu yang menarik
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                        disabled={uploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          <span>Mengupload...</span>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Klik untuk upload gambar
                          </p>
                          <p className="text-xs text-muted-foreground">
                            JPG, PNG maksimal 5MB
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  
                  {!imagePreview && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Pilih Gambar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan</CardTitle>
                <CardDescription>
                  Status dan pengaturan menu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Menu Tersedia</Label>
                    <p className="text-sm text-muted-foreground">
                      Menu dapat dipesan pelanggan
                    </p>
                  </div>
                  <Switch
                    checked={formData.available}
                    onCheckedChange={(checked) => setFormData({...formData, available: checked})}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Menu Featured
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Tampilkan di menu unggulan
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})}
                  />
                </div>
              </CardContent>
            </Card>

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
                      'Simpan Menu'
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

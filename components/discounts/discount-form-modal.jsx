import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function DiscountFormModal({ isOpen, onClose, discount = null, onSuccess }) {
  const isEdit = Boolean(discount);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: discount?.name || '',
    description: discount?.description || '',
    code: discount?.code || '',
    type: discount?.type || 'percentage',
    value: discount?.value || 0,
    target: discount?.target || 'order',
    min_order_amount: discount?.min_order_amount || 0,
    max_discount_amount: discount?.max_discount_amount || '',
    max_uses: discount?.max_uses || '',
    max_uses_per_user: discount?.max_uses_per_user || 1,
    starts_at: discount?.starts_at ? new Date(discount.starts_at).toISOString().slice(0, 16) : '',
    expires_at: discount?.expires_at ? new Date(discount.expires_at).toISOString().slice(0, 16) : '',
    first_order_only: discount?.first_order_only || false,
    is_active: discount?.is_active !== false
  });

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Nama diskon tidak boleh kosong');
      return;
    }
    if (!formData.value || formData.value <= 0) {
      alert('Nilai diskon harus lebih dari 0');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        code: formData.code.trim() || null,
        type: formData.type,
        value: parseFloat(formData.value),
        target: formData.target,
        min_order_amount: parseFloat(formData.min_order_amount) || 0,
        max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        max_uses_per_user: parseInt(formData.max_uses_per_user) || 1,
        starts_at: formData.starts_at || null,
        expires_at: formData.expires_at || null,
        first_order_only: formData.first_order_only,
        is_active: formData.is_active,
        ...(isEdit && { id: discount.id })
      };

      const response = await fetch('/api/discounts', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        alert(result.error || 'Terjadi kesalahan');
      }
    } catch (error) {
      alert('Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md max-h-[95vh] p-0">
        <div className="p-4 border-b">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Diskon' : 'Tambah Diskon Baru'}</DialogTitle>
          </DialogHeader>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Nama Diskon *</Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="mt-1 h-9"
                placeholder="Diskon Weekend"
              />
            </div>
            <div>
              <Label className="text-sm">Kode</Label>
              <Input 
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                className="mt-1 h-9"
                placeholder="WEEKEND50"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm">Deskripsi</Label>
            <Textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="mt-1 h-16 resize-none"
              placeholder="Deskripsi diskon"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-sm">Jenis *</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Persen (%)</SelectItem>
                  <SelectItem value="fixed_amount">Nominal (Rp)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Nilai *</Label>
              <Input 
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
                className="mt-1 h-9"
                placeholder="20"
              />
            </div>
            <div>
              <Label className="text-sm">Target</Label>
              <Select value={formData.target} onValueChange={(v) => setFormData({...formData, target: v})}>
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order">Pesanan</SelectItem>
                  <SelectItem value="item">Produk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Min Order (Rp)</Label>
              <Input 
                type="number"
                value={formData.min_order_amount}
                onChange={(e) => setFormData({...formData, min_order_amount: e.target.value})}
                className="mt-1 h-9"
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-sm">Max Diskon (Rp)</Label>
              <Input 
                type="number"
                value={formData.max_discount_amount}
                onChange={(e) => setFormData({...formData, max_discount_amount: e.target.value})}
                className="mt-1 h-9"
                placeholder="100000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Max Penggunaan</Label>
              <Input 
                type="number"
                value={formData.max_uses}
                onChange={(e) => setFormData({...formData, max_uses: e.target.value})}
                className="mt-1 h-9"
                placeholder="100"
              />
            </div>
            <div>
              <Label className="text-sm">Max per User</Label>
              <Input 
                type="number"
                value={formData.max_uses_per_user}
                onChange={(e) => setFormData({...formData, max_uses_per_user: e.target.value})}
                className="mt-1 h-9"
                placeholder="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Mulai</Label>
              <Input 
                type="datetime-local"
                value={formData.starts_at}
                onChange={(e) => setFormData({...formData, starts_at: e.target.value})}
                className="mt-1 h-9"
              />
            </div>
            <div>
              <Label className="text-sm">Berakhir</Label>
              <Input 
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                className="mt-1 h-9"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.first_order_only}
                onCheckedChange={(c) => setFormData({...formData, first_order_only: c})}
              />
              <Label className="text-sm">Hanya pesanan pertama</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(c) => setFormData({...formData, is_active: c})}
              />
              <Label className="text-sm">Diskon aktif</Label>
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-white flex gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 h-9"
          >
            Batal
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 h-9 bg-amber-500 hover:bg-amber-600"
          >
            {isSubmitting ? 'Saving...' : (isEdit ? 'Update' : 'Simpan')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
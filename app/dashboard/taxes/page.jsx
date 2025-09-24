"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, Search, ArrowUpDown, Eye, Receipt, Percent, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function TaxesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // State untuk modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedTax, setSelectedTax] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'percentage',
    value: 0,
    is_inclusive: false,
    min_order_amount: 0,
    is_active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data taxes
  const fetchTaxes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/taxes');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data || []);
      } else {
        toast.error(result.message || 'Gagal memuat data pajak');
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching taxes:', error);
      toast.error('Terjadi kesalahan saat memuat data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  // Format value berdasarkan type
  const formatValue = (tax) => {
    if (tax.type === 'percentage') {
      return `${parseFloat(tax.value)}%`;
    } else {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(parseFloat(tax.value));
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  // Definisi kolom tabel
  const columns = useMemo(
    () => [
      {
        header: 'No',
        size: 60,
        cell: ({ row, table }) => {
          const pageIndex = table.getState().pagination.pageIndex;
          const pageSize = table.getState().pagination.pageSize;
          return pageIndex * pageSize + row.index + 1;
        },
      },
      {
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 p-0 font-semibold"
            >
              Nama Pajak
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return (
            <div>
              <div className="font-medium">{row.getValue('name')}</div>
              {row.original.description && (
                <div className="text-sm text-muted-foreground line-clamp-1">
                  {row.original.description}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'type',
        header: 'Jenis',
        cell: ({ row }) => {
          const type = row.getValue('type');
          return (
            <Badge variant="outline" className={
              type === 'percentage' ? 'border-purple-200 bg-purple-50 text-purple-700' :
              'border-blue-200 bg-blue-50 text-blue-700'
            }>
              {type === 'percentage' ? (
                <><Percent className="h-3 w-3 mr-1" />Persentase</>
              ) : (
                <><DollarSign className="h-3 w-3 mr-1" />Nominal</>
              )}
            </Badge>
          );
        },
        size: 120,
      },
      {
        accessorKey: 'value',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 p-0 font-semibold"
            >
              Nilai
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return <div className="font-medium">{formatValue(row.original)}</div>;
        },
        size: 120,
      },
      {
        accessorKey: 'min_order_amount',
        header: 'Min. Pesanan',
        cell: ({ row }) => {
          return <div className="text-sm">{formatCurrency(row.getValue('min_order_amount'))}</div>;
        },
        size: 120,
      },
      {
        accessorKey: 'is_inclusive',
        header: 'Inklusif',
        cell: ({ row }) => {
          const isInclusive = row.getValue('is_inclusive');
          return (
            <Badge variant={isInclusive ? 'default' : 'outline'}>
              {isInclusive ? 'Ya' : 'Tidak'}
            </Badge>
          );
        },
        size: 100,
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => {
          const isActive = row.getValue('is_active');
          return (
            <Badge className={isActive ? 'bg-teal-500 text-slate-50' : 'bg-amber-500 text-slate-50'}>
              {isActive ? 'Aktif' : 'Nonaktif'}
            </Badge>
          );
        },
        size: 100,
      },
      {
        accessorKey: 'created_at',
        header: 'Dibuat',
        cell: ({ row }) => {
          const date = new Date(row.getValue('created_at'));
          return (
            <div className="text-sm text-muted-foreground">
              {date.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </div>
          );
        },
        size: 120,
      },
      {
        id: 'actions',
        header: 'Aksi',
        size: 140,
        cell: ({ row }) => {
          const tax = row.original;
          
          return (
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditClick(tax)}
                title="Edit pajak"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteClick(tax)}
                title="Hapus pajak"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
  });

  // Handle functions
  const handleAddClick = () => {
    setFormData({
      name: '',
      description: '',
      type: 'percentage',
      value: 0,
      is_inclusive: false,
      min_order_amount: 0,
      is_active: true
    });
    setIsAddModalOpen(true);
  };

  const handleEditClick = (tax) => {
    setSelectedTax(tax);
    setFormData({
      name: tax.name,
      description: tax.description || '',
      type: tax.type,
      value: tax.value,
      is_inclusive: tax.is_inclusive !== false,
      min_order_amount: tax.min_order_amount || 0,
      is_active: tax.is_active !== false
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (tax) => {
    setSelectedTax(tax);
    setIsDeleteAlertOpen(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nama pajak tidak boleh kosong');
      return;
    }

    if (!formData.value || formData.value <= 0) {
      toast.error('Nilai pajak harus lebih dari 0');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/taxes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          type: formData.type,
          value: parseFloat(formData.value),
          is_inclusive: formData.is_inclusive,
          min_order_amount: parseFloat(formData.min_order_amount) || 0,
          is_active: formData.is_active
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setIsAddModalOpen(false);
        fetchTaxes();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error adding tax:', error);
      toast.error('Terjadi kesalahan saat menambah pajak');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nama pajak tidak boleh kosong');
      return;
    }

    if (!formData.value || formData.value <= 0) {
      toast.error('Nilai pajak harus lebih dari 0');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/taxes/${selectedTax.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          type: formData.type,
          value: parseFloat(formData.value),
          is_inclusive: formData.is_inclusive,
          min_order_amount: parseFloat(formData.min_order_amount) || 0,
          is_active: formData.is_active
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setIsEditModalOpen(false);
        fetchTaxes();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error updating tax:', error);
      toast.error('Terjadi kesalahan saat memperbarui pajak');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/taxes/${selectedTax.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setIsDeleteAlertOpen(false);
        fetchTaxes();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error deleting tax:', error);
      toast.error('Terjadi kesalahan saat menghapus pajak');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat data pajak...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="h-6 w-6" />
            Kelola Pajak
          </h1>
          <p className="text-muted-foreground">
            Kelola pajak dan tarif pajak untuk pesanan
          </p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddClick} className="bg-amber-500 hover:bg-amber-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Pajak
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Tambah Pajak Baru</DialogTitle>
              <DialogDescription>
                Masukkan detail pajak baru untuk sistem pembayaran.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitAdd}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Pajak *</Label>
                    <Input
                      id="name"
                      placeholder="Contoh: PPN, Pajak Layanan"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Jenis Pajak *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Persentase (%)</SelectItem>
                        <SelectItem value="fixed_amount">Nominal Tetap (Rp)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    placeholder="Deskripsi pajak (opsional)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="value">
                      Nilai {formData.type === 'percentage' ? '(%)' : '(Rp)'} *
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      step={formData.type === 'percentage' ? '0.01' : '1'}
                      min="0"
                      placeholder={formData.type === 'percentage' ? '10' : '5000'}
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min_order_amount">Minimal Pesanan (Rp)</Label>
                    <Input
                      id="min_order_amount"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.min_order_amount}
                      onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                    />
                    <p className="text-sm text-muted-foreground">
                      Kosongkan jika tidak ada minimal
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_inclusive"
                    checked={formData.is_inclusive}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_inclusive: checked })}
                  />
                  <Label htmlFor="is_inclusive">Pajak sudah termasuk dalam harga</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Pajak aktif</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pajak</CardTitle>
          <CardDescription>
            Total {data.length} pajak terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 py-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari pajak..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} style={{ width: header.getSize() }}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Eye className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Tidak ada pajak ditemukan</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="hidden md:block text-sm text-muted-foreground">
              Menampilkan {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} -{' '}
              {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length)} dari{' '}
              {data.length} pajak
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Sebelumnya
              </Button>
              <div className="text-sm font-medium">
                Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Pajak</DialogTitle>
            <DialogDescription>
              Perbarui detail pajak sistem pembayaran.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nama Pajak *</Label>
                  <Input
                    id="edit-name"
                    placeholder="Masukkan nama pajak"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Jenis Pajak *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Persentase (%)</SelectItem>
                      <SelectItem value="fixed_amount">Nominal Tetap (Rp)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Deskripsi</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Deskripsi pajak (opsional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-value">
                    Nilai {formData.type === 'percentage' ? '(%)' : '(Rp)'} *
                  </Label>
                  <Input
                    id="edit-value"
                    type="number"
                    step={formData.type === 'percentage' ? '0.01' : '1'}
                    min="0"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-min_order_amount">Minimal Pesanan (Rp)</Label>
                  <Input
                    id="edit-min_order_amount"
                    type="number"
                    min="0"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is_inclusive"
                  checked={formData.is_inclusive}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_inclusive: checked })}
                />
                <Label htmlFor="edit-is_inclusive">Pajak sudah termasuk dalam harga</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="edit-is_active">Pajak aktif</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {isSubmitting ? 'Menyimpan...' : 'Perbarui'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pajak</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pajak "{selectedTax?.name}"?
              <br />
              Tindakan ini tidak dapat dibatalkan dan mungkin mempengaruhi pesanan yang sudah ada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
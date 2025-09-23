"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  ArrowUpDown, 
  Eye, 
  Filter,
  Settings,
  DollarSign,
  Star,
  ChefHat,
  Package
} from 'lucide-react';
import { toast } from 'sonner';

export default function DishVariantsPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // State untuk filter dan delete
  const [selectedDish, setSelectedDish] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [availableFilter, setAvailableFilter] = useState('all');
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data dish variants
  const fetchDishVariants = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      if (selectedDish !== 'all') params.append('dish_id', selectedDish);
      
      const response = await fetch(`/api/dish-variants?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data || []);
      } else {
        toast.error(result.message || 'Gagal memuat data varian');
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching dish variants:', error);
      toast.error('Terjadi kesalahan saat memuat data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dishes untuk filter
  const fetchDishes = async () => {
    try {
      const response = await fetch('/api/dishes');
      const result = await response.json();
      
      if (result.success) {
        setDishes(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching dishes:', error);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  useEffect(() => {
    fetchDishVariants();
  }, [selectedDish]);

  // Format currency helper
  const formatCurrency = (amount) => {
    if (!amount || amount === '0') return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get variant type badge color
  const getVariantTypeBadge = (type) => {
    const typeColors = {
      'size': 'bg-blue-100 text-blue-800',
      'flavor': 'bg-green-100 text-green-800',
      'spice_level': 'bg-red-100 text-red-800',
      'protein': 'bg-orange-100 text-orange-800',
      'add_on': 'bg-purple-100 text-purple-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    
    return typeColors[type] || typeColors.default;
  };

  // Filter data berdasarkan client-side filters
  const filteredData = useMemo(() => {
    return data.filter(variant => {
      // Filter by type
      if (typeFilter !== 'all' && variant.type !== typeFilter) {
        return false;
      }
      
      // Filter by availability
      if (availableFilter !== 'all') {
        const isAvailable = variant.is_available;
        if (availableFilter === 'true' && !isAvailable) return false;
        if (availableFilter === 'false' && isAvailable) return false;
      }

      // Global search
      if (globalFilter) {
        const searchTerm = globalFilter.toLowerCase();
        return (
          variant.name.toLowerCase().includes(searchTerm) ||
          variant.type.toLowerCase().includes(searchTerm)
        );
      }

      return true;
    });
  }, [data, typeFilter, availableFilter, globalFilter]);

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
              Nama Varian
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const variant = row.original;
          const dish = dishes.find(d => d.id === variant.dish_id);
          
          return (
            <div className="space-y-1">
              <div className="font-medium">{variant.name}</div>
              {dish && (
                <div className="text-sm text-muted-foreground">
                  Menu: {dish.name}
                </div>
              )}
              <div className="flex items-center gap-2">
                {variant.is_default && (
                  <Badge variant="default" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Default
                  </Badge>
                )}
              </div>
            </div>
          );
        },
        minSize: 250,
      },
      {
        accessorKey: 'type',
        header: 'Tipe Varian',
        cell: ({ row }) => {
          const type = row.getValue('type');
          const typeLabels = {
            'size': 'Ukuran',
            'flavor': 'Rasa',
            'spice_level': 'Level Pedas',
            'protein': 'Protein',
            'add_on': 'Tambahan'
          };
          
          return (
            <Badge className={getVariantTypeBadge(type)}>
              {typeLabels[type] || type}
            </Badge>
          );
        },
        size: 130,
      },
      {
        accessorKey: 'price_modifier',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 p-0 font-semibold"
            >
              <DollarSign className="h-4 w-4 mr-1" />
              Modifier Harga
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const priceModifier = parseFloat(row.getValue('price_modifier') || '0');
          
          return (
            <div className={`font-semibold ${
              priceModifier > 0 ? 'text-green-600' : 
              priceModifier < 0 ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {priceModifier > 0 && '+'}
              {formatCurrency(priceModifier)}
            </div>
          );
        },
        size: 150,
      },
      {
        accessorKey: 'sort_order',
        header: 'Urutan',
        cell: ({ row }) => {
          const sortOrder = row.getValue('sort_order');
          return (
            <div className="text-center font-mono">
              {sortOrder}
            </div>
          );
        },
        size: 80,
      },
      {
        accessorKey: 'is_available',
        header: 'Status',
        cell: ({ row }) => {
          const available = row.getValue('is_available');
          return (
            <Badge variant={available ? 'default' : 'secondary'}>
              {available ? 'Tersedia' : 'Tidak Tersedia'}
            </Badge>
          );
        },
        size: 120,
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
        size: 100,
      },
      {
        id: 'actions',
        header: 'Aksi',
        size: 140,
        cell: ({ row }) => {
          const variant = row.original;
          
          return (
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/dish-variants/${variant.id}`)}
                title="Lihat detail"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/dish-variants/${variant.id}/edit`)}
                title="Edit varian"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteClick(variant)}
                title="Hapus varian"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          );
        },
      },
    ],
    [router, dishes]
  );

  const table = useReactTable({
    data: filteredData,
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
  const handleDeleteClick = (variant) => {
    setSelectedVariant(variant);
    setIsDeleteAlertOpen(true);
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/dish-variants/${selectedVariant.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setIsDeleteAlertOpen(false);
        fetchDishVariants();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error deleting dish variant:', error);
      toast.error('Terjadi kesalahan saat menghapus varian');
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kelola Varian Menu</h1>
          <p className="text-muted-foreground">
            Kelola varian menu seperti ukuran, rasa, dan tambahan
          </p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/dish-variants/create')}
          className="bg-amber-500 hover:bg-amber-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Varian
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Daftar Varian Menu
          </CardTitle>
          <CardDescription>
            Total {filteredData.length} varian dari {data.length} total varian
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 py-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari varian..."
                value={globalFilter ?? ''}
                onChange={(event) => setGlobalFilter(String(event.target.value))}
                className="max-w-sm"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              
              <Select value={selectedDish} onValueChange={setSelectedDish}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Menu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Menu</SelectItem>
                  {dishes.map((dish) => (
                    <SelectItem key={dish.id} value={dish.id.toString()}>
                      {dish.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="size">Ukuran</SelectItem>
                  <SelectItem value="flavor">Rasa</SelectItem>
                  <SelectItem value="spice_level">Level Pedas</SelectItem>
                  <SelectItem value="protein">Protein</SelectItem>
                  <SelectItem value="add_on">Tambahan</SelectItem>
                </SelectContent>
              </Select>

              <Select value={availableFilter} onValueChange={setAvailableFilter}>
                <SelectTrigger className="w-[120px] hidden md:block">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="true">Tersedia</SelectItem>
                  <SelectItem value="false">Tidak Tersedia</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                      className="hover:bg-muted/50"
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
                        <Package className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Tidak ada varian ditemukan</p>
                        <Button 
                          variant="outline" 
                          onClick={() => router.push('/dashboard/dish-variants/create')}
                          className="mt-2"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Tambah Varian Pertama
                        </Button>
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
              {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, filteredData.length)} dari{' '}
              {filteredData.length} varian
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

      {/* Delete Alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Varian</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus varian "{selectedVariant?.name}"?
              <br /><br />
              Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait varian ini.
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
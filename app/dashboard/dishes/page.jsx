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
  Clock,
  DollarSign,
  Star,
  ChefHat,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

export default function DishesPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // State untuk filter dan delete
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availableFilter, setAvailableFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data dishes
  const fetchDishes = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category_id', selectedCategory);
      if (availableFilter !== 'all') params.append('available', availableFilter);
      if (featuredFilter !== 'all') params.append('featured', featuredFilter);
      if (globalFilter) params.append('search', globalFilter);
      
      const response = await fetch(`/api/dishes?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data || []);
      } else {
        toast.error(result.message || 'Gagal memuat data menu');
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching dishes:', error);
      toast.error('Terjadi kesalahan saat memuat data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories untuk filter
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

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchDishes();
  }, [selectedCategory, availableFilter, featuredFilter, globalFilter]);

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
        accessorKey: 'image',
        header: 'Gambar',
        cell: ({ row }) => {
          const image = row.getValue('image');
          const name = row.original.name;
          
          return (
            <div className="flex items-center justify-center w-16 h-12 bg-muted rounded-md overflow-hidden">
              {image ? (
                <img 
                  src={image} 
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center ${image ? 'hidden' : 'flex'}`}>
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          );
        },
        size: 80,
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
              Nama Menu
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const dish = row.original;
          return (
            <div className="space-y-1">
              <div className="font-medium">{dish.name}</div>
              {dish.description && (
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {dish.description}
                </div>
              )}
              <div className="flex items-center gap-2">
                {dish.is_featured && (
                  <Badge variant="default" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {dish.preparation_time && (
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {dish.preparation_time}m
                  </span>
                )}
              </div>
            </div>
          );
        },
        minSize: 250,
      },
      {
        accessorKey: 'category_name',
        header: 'Kategori',
        cell: ({ row }) => {
          const categoryName = row.getValue('category_name');
          return categoryName ? (
            <Badge variant="outline">{categoryName}</Badge>
          ) : (
            <span className="text-muted-foreground text-sm">Tanpa kategori</span>
          );
        },
        size: 130,
      },
      {
        accessorKey: 'price',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 p-0 font-semibold"
            >
              <DollarSign className="h-4 w-4 mr-1" />
              Harga
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const price = parseFloat(row.getValue('price'));
          const costPrice = row.original.cost_price ? parseFloat(row.original.cost_price) : null;
          
          return (
            <div className="space-y-1">
              <div className="font-semibold text-green-600">
                {formatCurrency(price)}
              </div>
              {costPrice && (
                <div className="text-xs text-muted-foreground">
                  Modal: {formatCurrency(costPrice)}
                </div>
              )}
            </div>
          );
        },
        size: 120,
      },
      {
        accessorKey: 'available',
        header: 'Status',
        cell: ({ row }) => {
          const available = row.getValue('available');
          return (
            <Badge variant={available ? 'default' : 'secondary'}>
              {available ? 'Tersedia' : 'Tidak Tersedia'}
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
        size: 100,
      },
      {
        id: 'actions',
        header: 'Aksi',
        size: 140,
        cell: ({ row }) => {
          const dish = row.original;
          
          return (
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/dishes/${dish.id}`)}
                title="Lihat detail"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/dishes/${dish.id}/edit`)}
                title="Edit menu"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteClick(dish)}
                title="Hapus menu"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          );
        },
      },
    ],
    [router]
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
  const handleDeleteClick = (dish) => {
    setSelectedDish(dish);
    setIsDeleteAlertOpen(true);
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/dishes/${selectedDish.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setIsDeleteAlertOpen(false);
        fetchDishes();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error deleting dish:', error);
      toast.error('Terjadi kesalahan saat menghapus menu');
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kelola Menu</h1>
          <p className="text-muted-foreground">
            Kelola menu makanan dan minuman restaurant
          </p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/dishes/create')}
          className="bg-amber-500 hover:bg-amber-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Menu
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Daftar Menu
          </CardTitle>
          <CardDescription>
            Total {data.length} menu terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 py-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari menu..."
                value={globalFilter ?? ''}
                onChange={(event) => setGlobalFilter(String(event.target.value))}
                className="max-w-sm"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={availableFilter} onValueChange={setAvailableFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="true">Tersedia</SelectItem>
                  <SelectItem value="false">Tidak Tersedia</SelectItem>
                </SelectContent>
              </Select>

              <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
                <SelectTrigger className="w-[120px] hidden md:block">
                  <SelectValue placeholder="Featured" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="true">Featured</SelectItem>
                  <SelectItem value="false">Bukan Featured</SelectItem>
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
                        <ChefHat className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Tidak ada menu ditemukan</p>
                        <Button 
                          variant="outline" 
                          onClick={() => router.push('/dashboard/dishes/create')}
                          className="mt-2"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Tambah Menu Pertama
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
              {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length)} dari{' '}
              {data.length} menu
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
            <AlertDialogTitle>Hapus Menu</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus menu "{selectedDish?.name}"?
              <br /><br />
              Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait menu ini.
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
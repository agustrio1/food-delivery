import { useMemo } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { 
  Pencil, 
  Trash2, 
  ArrowUpDown, 
  Eye, 
  Percent, 
  DollarSign,
  ShoppingCart,
  Package,
  Tag,
  Truck
} from 'lucide-react';

export default function DiscountTable({ 
  data, 
  sorting, 
  setSorting,
  columnFilters,
  setColumnFilters,
  globalFilter,
  setGlobalFilter,
  pagination,
  setPagination,
  onEdit,
  onDelete 
}) {
  // Format value berdasarkan type
  const formatValue = (discount) => {
    if (discount.type === 'percentage') {
      return `${parseFloat(discount.value)}%`;
    } else {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(parseFloat(discount.value));
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get target label
  const getTargetLabel = (target) => {
    const targets = {
      order: 'Pesanan',
      item: 'Produk',
      category: 'Kategori',
      delivery: 'Pengiriman'
    };
    return targets[target] || target;
  };

  // Get target icon
  const getTargetIcon = (target) => {
    const icons = {
      order: ShoppingCart,
      item: Package,
      category: Tag,
      delivery: Truck
    };
    const Icon = icons[target] || Tag;
    return <Icon className="h-3 w-3 mr-1" />;
  };

  // Check if discount is expired
  const isExpired = (discount) => {
    if (!discount.expires_at) return false;
    return new Date(discount.expires_at) < new Date();
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
          return (
            <div className="text-center text-sm">
              {pageIndex * pageSize + row.index + 1}
            </div>
          );
        },
      },
      {
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 p-0 font-semibold text-xs sm:text-sm"
            >
              Nama Diskon
              <ArrowUpDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return (
            <div className="min-w-0">
              <div className="font-medium text-sm truncate">{row.getValue('name')}</div>
              {row.original.code && (
                <div className="text-xs text-muted-foreground mt-1">
                  <span className="font-mono bg-gray-100 px-1 rounded text-xs">
                    {row.original.code}
                  </span>
                </div>
              )}
              {row.original.description && (
                <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {row.original.description}
                </div>
              )}
            </div>
          );
        },
        minSize: 200,
      },
      {
        accessorKey: 'type',
        header: 'Jenis',
        cell: ({ row }) => {
          const type = row.getValue('type');
          return (
            <Badge variant="outline" className={`text-xs ${
              type === 'percentage' 
                ? 'border-purple-200 bg-purple-50 text-purple-700' 
                : 'border-blue-200 bg-blue-50 text-blue-700'
            }`}>
              <span className="hidden sm:inline">
                {type === 'percentage' ? (
                  <><Percent className="h-3 w-3 mr-1" />Persentase</>
                ) : (
                  <><DollarSign className="h-3 w-3 mr-1" />Nominal</>
                )}
              </span>
              <span className="sm:hidden">
                {type === 'percentage' ? '%' : 'Rp'}
              </span>
            </Badge>
          );
        },
        size: 100,
      },
      {
        accessorKey: 'value',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 p-0 font-semibold text-xs sm:text-sm"
            >
              Nilai
              <ArrowUpDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return (
            <div className="font-medium text-sm">
              {formatValue(row.original)}
            </div>
          );
        },
        size: 120,
      },
      {
        accessorKey: 'target',
        header: 'Target',
        cell: ({ row }) => {
          const target = row.getValue('target');
          return (
            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 text-xs">
              <span className="hidden sm:inline">
                {getTargetIcon(target)}
                {getTargetLabel(target)}
              </span>
              <span className="sm:hidden">
                {getTargetLabel(target).slice(0, 3)}
              </span>
            </Badge>
          );
        },
        size: 120,
      },
      {
        accessorKey: 'min_order_amount',
        header: <span className="hidden sm:inline">Min. Pesanan</span>,
        cell: ({ row }) => {
          return (
            <div className="text-xs sm:text-sm hidden sm:block">
              {formatCurrency(row.getValue('min_order_amount'))}
            </div>
          );
        },
        size: 120,
      },
      {
        accessorKey: 'current_uses',
        header: <span className="hidden md:inline">Penggunaan</span>,
        cell: ({ row }) => {
          const current = row.original.current_uses || 0;
          const max = row.original.max_uses;
          return (
            <div className="text-xs sm:text-sm hidden md:block">
              <div className="font-medium">{current}</div>
              {max && (
                <div className="text-muted-foreground">dari {max}</div>
              )}
            </div>
          );
        },
        size: 100,
      },
      {
        accessorKey: 'expires_at',
        header: <span className="hidden lg:inline">Berakhir</span>,
        cell: ({ row }) => {
          const discount = row.original;
          const expired = isExpired(discount);
          return (
            <div className="text-xs hidden lg:block">
              {discount.expires_at ? (
                <div className={expired ? 'text-red-500' : 'text-muted-foreground'}>
                  {formatDate(discount.expires_at)}
                  {expired && <div className="text-xs">Kedaluwarsa</div>}
                </div>
              ) : (
                <span className="text-muted-foreground">Tidak terbatas</span>
              )}
            </div>
          );
        },
        size: 140,
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => {
          const isActive = row.getValue('is_active');
          const expired = isExpired(row.original);
          
          if (expired) {
            return (
              <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                <span className="hidden sm:inline">Kedaluwarsa</span>
                <span className="sm:hidden">Exp</span>
              </Badge>
            );
          }
          
          return (
            <Badge className={`text-xs ${
              isActive 
                ? 'bg-teal-500 text-slate-50' 
                : 'bg-amber-500 text-slate-50'
            }`}>
              {isActive ? 'Aktif' : 'Nonaktif'}
            </Badge>
          );
        },
        size: 100,
      },
      {
        id: 'actions',
        header: 'Aksi',
        size: 80,
        cell: ({ row }) => {
          const discount = row.original;
          
          return (
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(discount)}
                title="Edit diskon"
                className="h-7 w-7 p-0 sm:h-8 sm:w-8"
              >
                <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(discount)}
                title="Hapus diskon"
                className="h-7 w-7 p-0 sm:h-8 sm:w-8"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
              </Button>
            </div>
          );
        },
      },
    ],
    [onEdit, onDelete]
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

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="overflow-x-auto">
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
                      <TableCell key={cell.id} className="py-2 sm:py-3">
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
                      <p className="text-muted-foreground">Tidak ada diskon ditemukan</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 space-x-0 sm:space-x-2">
        <div className="hidden md:block text-sm text-muted-foreground">
          Menampilkan {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} -{' '}
          {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length)} dari{' '}
          {data.length} diskon
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="text-xs sm:text-sm"
          >
            Sebelumnya
          </Button>
          <div className="text-xs sm:text-sm font-medium">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="text-xs sm:text-sm"
          >
            Selanjutnya
          </Button>
        </div>
      </div>
    </div>
  );
}
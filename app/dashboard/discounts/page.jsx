"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Tag } from 'lucide-react';
import { toast } from 'sonner';

// Import komponen yang sudah dipecah
import DiscountFormModal from '@/components/discounts/discount-form-modal';
import DiscountTable from '@/components/discounts/discount-table';
import DiscountDeleteAlert from '@/components/discounts/discount-delete-alert';

export default function DiscountsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Table states
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);

  // Fetch data discounts
  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/discounts');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data || []);
      } else {
        toast.error(result.message || 'Gagal memuat data diskon');
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
      toast.error('Terjadi kesalahan saat memuat data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  // Handle functions
  const handleAddClick = () => {
    setSelectedDiscount(null);
    setIsAddModalOpen(true);
  };

  const handleEditClick = (discount) => {
    setSelectedDiscount(discount);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (discount) => {
    setSelectedDiscount(discount);
    setIsDeleteAlertOpen(true);
  };

  const handleModalSuccess = () => {
    fetchDiscounts();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat data diskon...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Tag className="h-5 w-5 sm:h-6 sm:w-6" />
            Kelola Diskon
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Kelola diskon dan promosi untuk meningkatkan penjualan
          </p>
        </div>
        <Button 
          onClick={handleAddClick} 
          className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Diskon
        </Button>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Daftar Diskon</CardTitle>
          <CardDescription className="text-sm">
            Total {data.length} diskon terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari diskon..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="max-w-xs text-sm"
            />
          </div>

          {/* Table */}
          <DiscountTable
            data={data}
            sorting={sorting}
            setSorting={setSorting}
            columnFilters={columnFilters}
            setColumnFilters={setColumnFilters}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            pagination={pagination}
            setPagination={setPagination}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <DiscountFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        discount={null}
        onSuccess={handleModalSuccess}
      />

      <DiscountFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        discount={selectedDiscount}
        onSuccess={handleModalSuccess}
      />

      <DiscountDeleteAlert
        isOpen={isDeleteAlertOpen}
        onClose={() => setIsDeleteAlertOpen(false)}
        discount={selectedDiscount}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
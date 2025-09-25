import { useState } from 'react';
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
import { toast } from 'sonner';

export default function DiscountDeleteAlert({
  isOpen,
  onClose,
  discount,
  onSuccess,
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!discount) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/discounts?id=${discount.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || 'Diskon berhasil dihapus');
        onSuccess();
        onClose();
      } else {
        toast.error(result.error || 'Gagal menghapus diskon');
      }
    } catch (error) {
      console.error('Error deleting discount:', error);
      toast.error('Terjadi kesalahan saat menghapus diskon');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="w-[95vw] max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg">Hapus Diskon</AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            Apakah Anda yakin ingin menghapus diskon "{discount?.name}"?
            <br />
            <span className="text-muted-foreground mt-2 block">
              Tindakan ini tidak dapat dibatalkan dan mungkin mempengaruhi pesanan yang sedang berlangsung.
            </span>
            {discount?.current_uses > 0 && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-amber-700 text-sm font-medium">
                  ⚠️ Peringatan
                </p>
                <p className="text-amber-700 text-sm mt-1">
                  Diskon ini telah digunakan {discount.current_uses} kali.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <AlertDialogCancel 
            disabled={isDeleting}
            className="w-full sm:w-auto text-sm"
          >
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white text-sm"
          >
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
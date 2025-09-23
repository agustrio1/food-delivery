'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  requireAuth = true,
  fallbackPath = '/login'
}) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Redirect jika tidak authenticated dan require auth
      if (requireAuth && !isAuthenticated) {
        router.push(fallbackPath);
        return;
      }

      // Redirect jika role tidak sesuai
      if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [loading, isAuthenticated, user, router, requireAuth, allowedRoles, fallbackPath]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Show unauthorized message if role doesn't match
  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertDescription>
            You don't have permission to access this page. Required roles: {allowedRoles.join(', ')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook untuk mempermudah penggunaan
export function useRequireAuth(allowedRoles = []) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [loading, isAuthenticated, user, router, allowedRoles]);

  return {
    user,
    loading,
    isAuthenticated,
    hasAccess: !loading && isAuthenticated && (allowedRoles.length === 0 || (user && allowedRoles.includes(user.role)))
  };
}

// Contoh penggunaan:
// 1. Untuk protect seluruh page:
// export default function AdminPage() {
//   return (
//     <ProtectedRoute allowedRoles={['admin']}>
//       <div>Admin only content</div>
//     </ProtectedRoute>
//   );
// }

// 2. Menggunakan hook:
// export default function StaffPage() {
//   const { hasAccess, loading } = useRequireAuth(['admin', 'staff']);
//   
//   if (loading || !hasAccess) return null;
//   
//   return <div>Staff content</div>;
// }
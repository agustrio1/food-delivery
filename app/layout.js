import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from "@/components/ui/sonner";
import { Skeleton } from '@/components/ui/skeleton';
import NavbarWrapper from '@/components/navbar-wrapper';
import '@/styles/globals.css';

export const metadata = {
  title: 'Restaurant App',
  description: 'Restaurant management system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <main className="pb-20">
              {children}
            </main>

            {/* Bottom Navbar Wrapper - Client component handles conditional rendering */}
            <NavbarWrapper />
          </div>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}

// Loading component for when auth is being checked
export function MainLayoutSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        
        {/* Content skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>

        {/* Card-like skeletons */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        {/* List skeleton */}
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
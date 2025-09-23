// app/unauthorized/page.js
'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <ShieldX className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don&apos;t have permission to access this resource
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>Current user: <span className="font-medium">{user?.name || 'Unknown'}</span></p>
            <p>Role: <span className="font-medium capitalize">{user?.role || 'Unknown'}</span></p>
            <p className="mt-2">Only <span className="font-medium">admin</span> users can access the dashboard.</p>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={() => router.back()}
              variant="outline" 
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            
            <Button 
              onClick={() => router.push('/')}
              variant="outline" 
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
            
            <Button 
              onClick={logout}
              variant="destructive" 
              className="w-full"
            >
              Logout & Login as Admin
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import { useAuth } from '@/contexts/auth-context';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/navbar';

export default function NavbarWrapper() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Don't render anything while loading
  if (loading) {
    return null;
  }

  const hideNavbarPaths = [
    '/login',
    '/register', 
    '/forgot-password',
    '/reset-password'
  ];

  // Check if current path starts with these prefixes
  const hideNavbarPrefixes = [
    '/dashboard',
    '/kitchen',
    '/cashier'
  ];

  // Function to determine if navbar should be shown
  const shouldShowNavbar = () => {
    // Hide on specific auth pages
    if (hideNavbarPaths.includes(pathname)) {
      return false;
    }

    // Hide on dashboard, kitchen, and cashier pages
    if (hideNavbarPrefixes.some(prefix => pathname.startsWith(prefix))) {
      return false;
    }

    return true;
  };

  // Only render navbar when conditions are met
  return shouldShowNavbar() ? <Navbar /> : null;
}
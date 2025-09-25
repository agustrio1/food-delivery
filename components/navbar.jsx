'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import React from 'react';
import { 
  Home, 
  ShoppingCart, 
  ClipboardList, 
  User,
  ChefHat,
  LayoutDashboard,
  Calculator
} from 'lucide-react';

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  // Determine which menu to show based on user role
  const getLastMenuItem = () => {
    if (!user) return { icon: User, href: '/profile', label: 'Profile' };
    
    switch (user.role) {
      case 'kitchen':
      case 'chef':
        return { icon: ChefHat, href: '/kitchen', label: 'Kitchen' };
      case 'admin':
        return { icon: LayoutDashboard, href: '/dashboard', label: 'Dashboard' };
      case 'cashier':
        return { icon: Calculator, href: '/cashier', label: 'Kasir' };
      default:
        return { icon: User, href: '/profile', label: 'Profile' };
    }
  };

  const lastMenuItem = getLastMenuItem();

  const menuItems = [
    { icon: Home, href: '/', label: 'Beranda' },
    { icon: ShoppingCart, href: '/cart', label: 'Keranjang' },
    { icon: ClipboardList, href: '/orders', label: 'Order' },
    lastMenuItem
  ];

  const isActive = (href) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Handle click with authentication check
  const handleMenuClick = (e, item) => {
    const protectedRoutes = ['/dashboard', '/kitchen', '/cashier', '/profile'];
    
    if (!user && protectedRoutes.includes(item.href)) {
      e.preventDefault();
      router.push('/login');
      return;
    }
  };

  // Find active index for sliding ball position
  const getActiveIndex = () => {
    return menuItems.findIndex(item => isActive(item.href));
  };

  const activeIndex = getActiveIndex();

  return (
    <div className="fixed z-50 w-full max-w-lg -translate-x-1/2 bottom-4 left-1/2">
      {/* Sliding Ball */}
      <div 
        className={`absolute -top-4 w-16 h-16 bg-amber-500 rounded-full transition-all duration-300 ease-out shadow-lg ${
          activeIndex >= 0 ? 'opacity-100' : 'opacity-0'
        } flex flex-col items-center justify-center z-20`}
        style={{
          left: `calc(${(activeIndex * 25) + 12.5}% - 32px)`,
        }}
      >
        {activeIndex >= 0 && (
          <>
            {React.createElement(menuItems[activeIndex].icon, {
              className: 'w-5 h-5 mb-1 text-white'
            })}
            <span className="text-[10px] leading-none text-white font-medium">
              {menuItems[activeIndex].label}
            </span>
          </>
        )}
      </div>
      
      {/* Navbar background with notch */}
      <div className="relative bg-white border border-gray-200 rounded-full dark:bg-gray-700 dark:border-gray-600 shadow-lg h-16">
        {/* Notch/Cutout effect */}
        <div 
          className={`absolute -top-4 w-20 h-8 bg-white dark:bg-gray-700 rounded-t-full transition-all duration-300 ease-out ${
            activeIndex >= 0 ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            left: `calc(${(activeIndex * 25) + 12.5}% - 40px)`,
          }}
        />
        
        <div className="grid h-full grid-cols-4 mx-auto relative z-10">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={(e) => handleMenuClick(e, item)}
                className={`inline-flex flex-col items-center justify-center px-3 py-2 text-xs font-medium transition-colors duration-200 ${
                  index === 0 ? 'rounded-l-full' : 
                  index === menuItems.length - 1 ? 'rounded-r-full' : ''
                } ${
                  active 
                    ? 'text-transparent pointer-events-none' 
                    : 'text-gray-500 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400'
                }`}
              >
                <Icon 
                  className={`w-5 h-5 mb-1 transition-colors duration-200 ${
                    active ? 'text-transparent' : ''
                  }`} 
                />
                <span className="text-[10px] leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
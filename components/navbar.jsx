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

  const handleMenuClick = (e, item) => {
    const protectedRoutes = ['/dashboard', '/kitchen', '/cashier', '/profile'];
    
    if (!user && protectedRoutes.includes(item.href)) {
      e.preventDefault();
      router.push('/login');
      return;
    }
  };

  const activeIndex = menuItems.findIndex(item => isActive(item.href));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:max-w-[375px] md:mx-auto">
      <div className="relative mx-4 mb-4">
        {/* Ball */}
        {activeIndex >= 0 && (
          <div 
            className="absolute -top-3 w-12 h-12 bg-amber-500 rounded-full transition-all duration-300 ease-out shadow-lg flex flex-col items-center justify-center z-30"
            style={{
              left: `calc(${(activeIndex * 25) + 12.5}% - 24px)`,
            }}
          >
            {React.createElement(menuItems[activeIndex].icon, {
              className: 'w-4 h-4 mb-0.5 text-white'
            })}
            <span className="text-[8px] leading-none text-white font-medium">
              {menuItems[activeIndex].label}
            </span>
          </div>
        )}
        
        {/* Navbar */}
        <div className="relative bg-white rounded-full shadow-lg h-14 border border-gray-100">
          {/* Cutout */}
          {activeIndex >= 0 && (
            <div 
              className="absolute -top-3 w-12 h-6 transition-all duration-300 ease-out z-20"
              style={{
                left: `calc(${(activeIndex * 25) + 12.5}% - 50%)`,
                backgroundColor: 'white',
                borderRadius: '50%',
                boxShadow: '0 1px 0 0 #f3f4f6',
              }}
            />
          )}
          
          <div className="grid h-full grid-cols-4 mx-auto relative z-10">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={(e) => handleMenuClick(e, item)}
                  className={`inline-flex flex-col items-center justify-center px-3 py-2 text-xs font-medium transition-colors duration-200 rounded-full ${
                    active 
                      ? 'text-transparent pointer-events-none' 
                      : 'text-gray-500 hover:text-amber-600 active:text-amber-700'
                  }`}
                >
                  <Icon 
                    className={`w-4 h-4 mb-0.5 transition-colors duration-200 ${
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
    </div>
  );
};

export default Navbar;
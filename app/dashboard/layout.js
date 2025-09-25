'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarInset, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarSeparator,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Users, 
  ShoppingCart, 
  ChefHat, 
  Settings, 
  LogOut,
  Utensils,
  Package,
  BarChart3,
  CreditCard,
  MapPin,
  BadgePercent,
  TicketPercent
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    roles: ['admin']
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: Users,
    roles: ['admin']
  },
  {
    title: "Categories",
    url: "/dashboard/categories",
    icon: Package,
    roles: ['admin']
  },
  {
    title: "Menu Items",
    url: "/dashboard/dishes",
    icon: Utensils,
    roles: ['admin']
  },
  {
    title: "Variasi Menu",
    url: "/dashboard/dish-variants",
    icon: Utensils,
    roles: ['admin']
  },
  {
    title: "Pajak (PPn)",
    url: "/dashboard/taxes",
    icon: BadgePercent,
    roles: ['admin']
  },
  {
    title: "Diskon",
    url: "/dashboard/discounts",
    icon: TicketPercent,
    roles: ['admin']
  },
  {
    title: "Orders",
    url: "/dashboard/orders",
    icon: ShoppingCart,
    roles: ['admin']
  },
  {
    title: "Kitchen",
    url: "/dashboard/kitchen",
    icon: ChefHat,
    roles: ['admin']
  },
  {
    title: "Deliveries",
    url: "/dashboard/deliveries",
    icon: MapPin,
    roles: ['admin']
  },
  {
    title: "Payments",
    url: "/dashboard/payments",
    icon: CreditCard,
    roles: ['admin']
  },
  {
    title: "Reports",
    url: "/dashboard/reports",
    icon: BarChart3,
    roles: ['admin']
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
    roles: ['admin']
  }
];

function AppSidebar({ user, logout }) {
  return (
    <Sidebar className="bg-background border-r">
      <SidebarHeader className="border-b bg-background">
        <div className="flex items-center gap-2 px-2 py-2">
          <ChefHat className="h-6 w-6" />
          <span className="font-semibold">Restaurant Admin</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems
                .filter(item => item.roles.includes(user?.role))
                .map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-background">
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="flex items-center gap-2 px-2 py-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={user?.name || 'User'} />
                <AvatarFallback>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left text-sm">
                <div className="font-medium">{user?.name}</div>
                <div className="text-muted-foreground text-xs capitalize">{user?.role}</div>
              </div>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={logout}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function DashboardLayout({ children }) {
  const { user, loading, logout, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Redirect jika tidak authenticated
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      // Redirect jika bukan admin
      if (!isAdmin) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect jika tidak ada akses
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar user={user} logout={logout} />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-50 w-full border-b bg-background backdrop-blur supports-[backdrop-filter]:bg-background">
            <div className="flex h-14 items-center gap-4 px-4">
              <SidebarTrigger />
              <div className="flex-1">
                <h1 className="font-semibold">Dashboard</h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Welcome back, {user?.name}
                </span>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 bg-background">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
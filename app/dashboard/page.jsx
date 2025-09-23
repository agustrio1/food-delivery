'use client';

import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  ShoppingCart, 
  ChefHat, 
  DollarSign,
  TrendingUp,
  Clock,
  Package,
  MapPin
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const statsCards = [
  {
    title: "Total Users",
    value: "1,234",
    description: "Active customers",
    icon: Users,
    trend: "+12%",
    trendUp: true
  },
  {
    title: "Today's Orders",
    value: "89",
    description: "Orders today",
    icon: ShoppingCart,
    trend: "+23%",
    trendUp: true
  },
  {
    title: "Revenue",
    value: "$12,345",
    description: "Monthly revenue",
    icon: DollarSign,
    trend: "+8%",
    trendUp: true
  },
  {
    title: "Menu Items",
    value: "156",
    description: "Available dishes",
    icon: Package,
    trend: "+3%",
    trendUp: true
  }
];

const recentOrders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    status: "preparing",
    total: "$45.99",
    time: "10 min ago"
  },
  {
    id: "ORD-002", 
    customer: "Jane Smith",
    status: "ready",
    total: "$32.50",
    time: "15 min ago"
  },
  {
    id: "ORD-003",
    customer: "Bob Johnson",
    status: "completed",
    total: "$78.25",
    time: "25 min ago"
  }
];

const kitchenTasks = [
  {
    id: "TASK-001",
    order: "ORD-001",
    dish: "Nasi Goreng Special",
    status: "cooking",
    time: "5 min"
  },
  {
    id: "TASK-002",
    order: "ORD-004", 
    dish: "Ayam Bakar",
    status: "pending",
    time: "2 min"
  },
  {
    id: "TASK-003",
    order: "ORD-005",
    dish: "Gado-gado",
    status: "ready",
    time: "12 min"
  }
];

function StatusBadge({ status }) {
  const variants = {
    pending: "bg-yellow-100 text-yellow-800",
    preparing: "bg-blue-100 text-blue-800",
    cooking: "bg-orange-100 text-orange-800", 
    ready: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800"
  };

  return (
    <Badge className={`${variants[status]} border-0`}>
      {status}
    </Badge>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}!</h2>
          <p className="text-muted-foreground">Here's what's happening with your restaurant today.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>{stat.description}</span>
                <span className={`flex items-center ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Recent Orders
            </CardTitle>
            <CardDescription>Latest orders from customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.customer}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={order.status} />
                    <div className="text-right">
                      <p className="font-medium">{order.total}</p>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {order.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Kitchen Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Kitchen Tasks
            </CardTitle>
            <CardDescription>Current kitchen preparation status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kitchenTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium">{task.dish}</p>
                      <p className="text-sm text-muted-foreground">{task.order}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={task.status} />
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {task.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Users className="h-8 w-8 mb-2 text-blue-600" />
                <p className="text-sm font-medium">Manage Users</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Package className="h-8 w-8 mb-2 text-green-600" />
                <p className="text-sm font-medium">Add Menu Item</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <ShoppingCart className="h-8 w-8 mb-2 text-purple-600" />
                <p className="text-sm font-medium">View Orders</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <MapPin className="h-8 w-8 mb-2 text-orange-600" />
                <p className="text-sm font-medium">Track Deliveries</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
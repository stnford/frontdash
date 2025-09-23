import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LogOut, Package, Truck, Clock, DollarSign, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface StaffDashboardProps {
  onNavigateToLanding: () => void;
}

export function StaffDashboard({ onNavigateToLanding }: StaffDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'drivers' | 'settings'>('overview');
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  
  const [pendingOrders, setPendingOrders] = useState([
    {
      id: "FD123456",
      restaurant: "Tony's Pizza Palace",
      customer: "John Smith",
      items: "2x Margherita Pizza, 1x Caesar Salad",
      total: 50.97,
      address: "123 Main St, City, State",
      phone: "5551234567",
      status: "pending"
    },
    {
      id: "FD123457", 
      restaurant: "Burger Junction",
      customer: "Sarah Johnson",
      items: "1x Classic Burger, 1x Fries",
      total: 18.50,
      address: "456 Oak Ave, City, State", 
      phone: "5559876543",
      status: "pending"
    }
  ]);

  const [assignedOrders, setAssignedOrders] = useState([
    {
      id: "FD123458",
      restaurant: "Sakura Sushi",
      driver: "Mike Wilson",
      status: "pickup",
      estimatedDelivery: "6:45 PM"
    }
  ]);

  const [availableDrivers] = useState([
    { id: "1", name: "Mike Wilson", status: "available" },
    { id: "2", name: "Lisa Brown", status: "available" },
    { id: "3", name: "David Lee", status: "on-delivery" }
  ]);

  const handleLogout = () => {
    toast.success("Logged out successfully");
    onNavigateToLanding();
  };

  const handlePasswordChange = () => {
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordForm.new.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/.test(passwordForm.new)) {
      toast.error("Password must contain uppercase, lowercase, and number");
      return;
    }

    toast.success("Password changed successfully");
    setPasswordForm({ current: "", new: "", confirm: "" });
    setIsFirstLogin(false);
  };

  const processOrder = (orderId: string) => {
    const order = pendingOrders.find(o => o.id === orderId);
    if (!order) return;

    // Calculate estimated delivery time (45 minutes from now)
    const estimatedTime = new Date(Date.now() + 45 * 60000).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    setPendingOrders(prev => prev.filter(o => o.id !== orderId));
    toast.success(`Order ${orderId} processed. Estimated delivery: ${estimatedTime}`);
  };

  const assignDriver = (orderId: string, driverId: string) => {
    const driver = availableDrivers.find(d => d.id === driverId);
    if (!driver) return;

    const order = pendingOrders.find(o => o.id === orderId);
    if (!order) return;

    const newAssignment = {
      id: orderId,
      restaurant: order.restaurant,
      driver: driver.name,
      status: "assigned",
      estimatedDelivery: new Date(Date.now() + 45 * 60000).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    setAssignedOrders(prev => [...prev, newAssignment]);
    setPendingOrders(prev => prev.filter(o => o.id !== orderId));
    toast.success(`Order ${orderId} assigned to ${driver.name}`);
  };

  const recordDelivery = (orderId: string) => {
    setAssignedOrders(prev => prev.filter(o => o.id !== orderId));
    toast.success(`Order ${orderId} marked as delivered`);
  };

  if (isFirstLogin) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>First Time Login - Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Current Password</Label>
              <Input 
                type="password"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
              />
            </div>
            <div>
              <Label>New Password</Label>
              <Input 
                type="password"
                value={passwordForm.new}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Must be 6+ characters with uppercase, lowercase, and number
              </p>
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input 
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
              />
            </div>
            <Button onClick={handlePasswordChange} className="w-full">
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-accent to-secondary py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onNavigateToLanding}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">Staff Dashboard</h1>
              <p className="text-white/80">Tony's Pizza Palace - Staff Member</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            className="text-white hover:bg-white/20"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <nav className="w-64 bg-muted/30 border-r border-border p-4">
          <div className="space-y-2">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('overview')}
            >
              <Package className="w-4 h-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={activeTab === 'orders' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('orders')}
            >
              <Package className="w-4 h-4 mr-2" />
              Kitchen Orders
            </Button>
            <Button
              variant={activeTab === 'drivers' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('drivers')}
            >
              <Truck className="w-4 h-4 mr-2" />
              Delivery Status
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('settings')}
            >
              <Clock className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Restaurant Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Orders Ready</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$287.50</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Today's Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                      <div>
                        <p className="font-medium">Order #FD123456</p>
                        <p className="text-sm text-muted-foreground">2x Margherita Pizza, 1x Caesar Salad</p>
                      </div>
                      <Badge>Preparing</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                      <div>
                        <p className="font-medium">Order #FD123457</p>
                        <p className="text-sm text-muted-foreground">1x Pepperoni Pizza</p>
                      </div>
                      <Badge className="bg-green-500 text-white">Ready</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Order Management</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle>Pending Orders Queue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingOrders.length === 0 ? (
                      <p className="text-muted-foreground">No pending orders</p>
                    ) : (
                      pendingOrders.map(order => (
                        <div key={order.id} className="border border-border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold">Order #{order.id}</h3>
                              <p className="text-sm text-muted-foreground">From: {order.restaurant}</p>
                            </div>
                            <Badge>Pending</Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <p><strong>Customer:</strong> {order.customer}</p>
                            <p><strong>Items:</strong> {order.items}</p>
                            <p><strong>Total:</strong> ${order.total}</p>
                            <p><strong>Address:</strong> {order.address}</p>
                            <p><strong>Phone:</strong> {order.phone}</p>
                          </div>
                          
                          <div className="flex gap-2 mt-4">
                            <Button 
                              size="sm" 
                              onClick={() => processOrder(order.id)}
                              className="bg-primary hover:bg-primary/90"
                            >
                              Process Order
                            </Button>
                            <select 
                              className="px-3 py-1 border border-border rounded text-sm"
                              onChange={(e) => e.target.value && assignDriver(order.id, e.target.value)}
                            >
                              <option value="">Assign Driver</option>
                              {availableDrivers
                                .filter(d => d.status === 'available')
                                .map(driver => (
                                  <option key={driver.id} value={driver.id}>
                                    {driver.name}
                                  </option>
                                ))
                              }
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'drivers' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Driver Assignment</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle>Active Deliveries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assignedOrders.length === 0 ? (
                      <p className="text-muted-foreground">No active deliveries</p>
                    ) : (
                      assignedOrders.map(order => (
                        <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                          <div>
                            <h3 className="font-medium">Order #{order.id}</h3>
                            <p className="text-sm text-muted-foreground">Driver: {order.driver}</p>
                            <p className="text-sm text-muted-foreground">From: {order.restaurant}</p>
                            <p className="text-sm text-muted-foreground">ETA: {order.estimatedDelivery}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={order.status === 'assigned' ? 'default' : 'secondary'}>
                              {order.status}
                            </Badge>
                            <Button 
                              size="sm" 
                              onClick={() => recordDelivery(order.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Mark Delivered
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Driver Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {availableDrivers.map(driver => (
                      <div key={driver.id} className="flex justify-between items-center p-3 border border-border rounded">
                        <span className="font-medium">{driver.name}</span>
                        <Badge variant={driver.status === 'available' ? 'default' : 'secondary'}>
                          {driver.status === 'available' ? 'Available' : 'On Delivery'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Settings</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Current Password</Label>
                    <Input 
                      type="password"
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>New Password</Label>
                    <Input 
                      type="password"
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Confirm New Password</Label>
                    <Input 
                      type="password"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                    />
                  </div>
                  <Button onClick={handlePasswordChange}>
                    Update Password
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
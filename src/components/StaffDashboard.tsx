import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LogOut, Package, Truck, Clock, DollarSign, ArrowLeft } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { api } from "../lib/api";

interface StaffDashboardProps {
  onNavigateToLanding: () => void;
}

type OrderSummary = {
  orderNumber: number;
  restName: string;
  driverName?: string;
  orderStatus: string;
  orderDate: string;
  orderTime: string;
  deliveryDate?: string;
  deliveryTime?: string;
};

export function StaffDashboard({ onNavigateToLanding }: StaffDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'drivers' | 'settings'>('overview');
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [drivers, setDrivers] = useState<{ name: string; status: string }[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [ord, drv] = await Promise.all([api.listOrders(), api.listDrivers()]);
        setOrders(ord as OrderSummary[]);
        setDrivers((drv as any[]).map(d => ({ name: d.driverName, status: d.employementStatus })));
      } catch (err: any) {
        toast.error(err?.message || "Failed to load data");
      }
    };
    void load();
  }, []);

  const pendingOrders = useMemo(
    () => orders.filter(o => o.orderStatus === "In Progress"),
    [orders]
  );
  const assignedOrders = useMemo(
    () => orders.filter(o => o.orderStatus === "AssignedDriver"),
    [orders]
  );

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

  const assignDriver = (orderNumber: number, driverName: string) => {
    const doAssign = async () => {
      try {
        await api.assignDriver(orderNumber, driverName);
        setOrders(prev => prev.map(o => o.orderNumber === orderNumber ? { ...o, driverName, orderStatus: "AssignedDriver" } : o));
        toast.success(`Order ${orderNumber} assigned to ${driverName}`);
      } catch (err: any) {
        toast.error(err?.message || "Failed to assign driver");
      }
    };
    void doAssign();
  };

  const recordDelivery = (orderNumber: number) => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8);
    const doDeliver = async () => {
      try {
        await api.markDelivered(orderNumber, dateStr, timeStr);
        setOrders(prev => prev.map(o => o.orderNumber === orderNumber ? { ...o, orderStatus: "Delivered", deliveryDate: dateStr, deliveryTime: timeStr } : o));
        toast.success(`Order ${orderNumber} marked as delivered`);
      } catch (err: any) {
        toast.error(err?.message || "Failed to mark delivered");
      }
    };
    void doDeliver();
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
              <Clock className="w-4 h-4 mr-2" />
              Orders
            </Button>
            <Button
              variant={activeTab === 'drivers' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('drivers')}
            >
              <Truck className="w-4 h-4 mr-2" />
              Drivers
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('settings')}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </nav>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{pendingOrders.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{assignedOrders.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Available Drivers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{drivers.filter(d => d.status === "Active").length}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="grid lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>Pending</CardTitle>
                  <Badge variant="secondary">{pendingOrders.length}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingOrders.map(order => (
                    <div key={order.orderNumber} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Order #{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">{order.restName}</p>
                        </div>
                        <Badge variant="secondary">{order.orderStatus}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => assignDriver(order.orderNumber, drivers.find(d => d.status === "Active")?.name || "")}>
                          Assign first available
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pendingOrders.length === 0 && <p className="text-sm text-muted-foreground">No pending orders.</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>Assigned</CardTitle>
                  <Badge variant="secondary">{assignedOrders.length}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {assignedOrders.map(order => (
                    <div key={order.orderNumber} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Order #{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">Driver: {order.driverName || 'N/A'}</p>
                        </div>
                        <Badge variant="secondary">{order.orderStatus}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => recordDelivery(order.orderNumber)}>Mark Delivered</Button>
                      </div>
                    </div>
                  ))}
                  {assignedOrders.length === 0 && <p className="text-sm text-muted-foreground">No assigned orders.</p>}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'drivers' && (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Drivers</CardTitle>
                <Badge variant="secondary">{drivers.length}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {drivers.map((d, idx) => (
                  <div key={idx} className="border rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{d.name}</p>
                      <Badge variant={d.status === "Active" ? "default" : "secondary"} className="capitalize mt-1">
                        {d.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {drivers.length === 0 && <p className="text-sm text-muted-foreground">No drivers loaded.</p>}
              </CardContent>
            </Card>
          )}

          {activeTab === 'settings' && (
            <Card className="max-w-xl">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
                <Button onClick={handlePasswordChange}>Update Password</Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

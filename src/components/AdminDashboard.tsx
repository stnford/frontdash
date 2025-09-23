import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LogOut, Users, Building, Truck, UserPlus, UserMinus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface AdminDashboardProps {
  onNavigateToLanding: () => void;
}

export function AdminDashboard({ onNavigateToLanding }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'restaurants' | 'staff' | 'drivers'>('overview');
  
  const [pendingRestaurants, setPendingRestaurants] = useState([
    { id: "1", name: "Bella Italia", contactPerson: "Marco Romano", email: "marco@bellaitalia.com", status: "pending" },
    { id: "2", name: "Sushi Zen", contactPerson: "Akira Tanaka", email: "akira@sushizen.com", status: "pending" }
  ]);

  const [staffMembers, setStaffMembers] = useState([
    { id: "1", name: "John Smith", username: "smith01", role: "staff", status: "active" },
    { id: "2", name: "Sarah Johnson", username: "johnson02", role: "staff", status: "active" }
  ]);

  const [drivers, setDrivers] = useState([
    { id: "1", name: "Mike Wilson", status: "available" },
    { id: "2", name: "Lisa Brown", status: "on-delivery" },
    { id: "3", name: "David Lee", status: "available" }
  ]);

  const [newStaffForm, setNewStaffForm] = useState({ fullName: "", username: "", password: "" });
  const [newDriverForm, setNewDriverForm] = useState({ name: "" });

  const handleLogout = () => {
    toast.success("Logged out successfully");
    onNavigateToLanding();
  };

  const approveRestaurant = (id: string) => {
    setPendingRestaurants(prev => prev.filter(r => r.id !== id));
    toast.success("Restaurant approved! Login credentials have been sent.");
  };

  const rejectRestaurant = (id: string) => {
    setPendingRestaurants(prev => prev.filter(r => r.id !== id));
    toast.success("Restaurant registration rejected.");
  };

  const addStaff = () => {
    if (!newStaffForm.fullName || newStaffForm.fullName.length < 2) {
      toast.error("Full name must be at least 2 characters");
      return;
    }

    const lastName = newStaffForm.fullName.split(' ').pop()?.toLowerCase() || '';
    const randomDigits = Math.floor(10 + Math.random() * 90).toString();
    const username = lastName + randomDigits;
    const password = Math.random().toString(36).substr(2, 8) + 'A1';

    const newStaff = {
      id: Date.now().toString(),
      name: newStaffForm.fullName,
      username,
      role: "staff",
      status: "active"
    };

    setStaffMembers(prev => [...prev, newStaff]);
    setNewStaffForm({ fullName: "", username: "", password: "" });
    toast.success(`Staff added! Username: ${username}, Password: ${password}`);
  };

  const deleteStaff = (id: string) => {
    const staff = staffMembers.find(s => s.id === id);
    if (confirm(`Are you sure you want to delete staff account ${staff?.username}?`)) {
      setStaffMembers(prev => prev.filter(s => s.id !== id));
      toast.success("Staff account deleted");
    }
  };

  const addDriver = () => {
    if (!newDriverForm.name.trim()) {
      toast.error("Driver name is required");
      return;
    }

    const newDriver = {
      id: Date.now().toString(),
      name: newDriverForm.name,
      status: "available"
    };

    setDrivers(prev => [...prev, newDriver]);
    setNewDriverForm({ name: "" });
    toast.success("Driver hired successfully");
  };

  const fireDriver = (id: string) => {
    const driver = drivers.find(d => d.id === id);
    if (confirm(`Are you sure you want to fire driver ${driver?.name}?`)) {
      setDrivers(prev => prev.filter(d => d.id !== id));
      toast.success("Driver removed");
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-accent py-4 px-6">
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
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-white/80">FrontDash Administrator</p>
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
              <Building className="w-4 h-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={activeTab === 'restaurants' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('restaurants')}
            >
              <Building className="w-4 h-4 mr-2" />
              Restaurants
            </Button>
            <Button
              variant={activeTab === 'staff' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('staff')}
            >
              <Users className="w-4 h-4 mr-2" />
              Staff Management
            </Button>
            <Button
              variant={activeTab === 'drivers' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('drivers')}
            >
              <Truck className="w-4 h-4 mr-2" />
              Driver Management
            </Button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Active Restaurants</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">6</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{pendingRestaurants.length}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{staffMembers.length}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Drivers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{drivers.length}</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'restaurants' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Restaurant Management</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle>Pending Registration Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingRestaurants.length === 0 ? (
                      <p className="text-muted-foreground">No pending requests</p>
                    ) : (
                      pendingRestaurants.map(restaurant => (
                        <div key={restaurant.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                          <div>
                            <h3 className="font-medium">{restaurant.name}</h3>
                            <p className="text-sm text-muted-foreground">Contact: {restaurant.contactPerson}</p>
                            <p className="text-sm text-muted-foreground">Email: {restaurant.email}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => approveRestaurant(restaurant.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => rejectRestaurant(restaurant.id)}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Staff Management</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle>Add New Staff Member</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Full Name (must be unique)</Label>
                    <Input 
                      value={newStaffForm.fullName}
                      onChange={(e) => setNewStaffForm(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="John Smith"
                    />
                  </div>
                  <Button onClick={addStaff}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Staff Member
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Staff Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {staffMembers.map(staff => (
                      <div key={staff.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h3 className="font-medium">{staff.name}</h3>
                          <p className="text-sm text-muted-foreground">Username: {staff.username}</p>
                          <Badge variant="outline">{staff.status}</Badge>
                        </div>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => deleteStaff(staff.id)}
                        >
                          <UserMinus className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'drivers' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Driver Management</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle>Hire New Driver</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Driver Name (must be unique)</Label>
                    <Input 
                      value={newDriverForm.name}
                      onChange={(e) => setNewDriverForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Mike Wilson"
                    />
                  </div>
                  <Button onClick={addDriver}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Hire Driver
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Drivers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {drivers.map(driver => (
                      <div key={driver.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h3 className="font-medium">{driver.name}</h3>
                          <Badge variant={driver.status === 'available' ? 'default' : 'secondary'}>
                            {driver.status === 'available' ? 'Available' : 'On Delivery'}
                          </Badge>
                        </div>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => fireDriver(driver.id)}
                        >
                          <UserMinus className="w-4 h-4 mr-2" />
                          Fire
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
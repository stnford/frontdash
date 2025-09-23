import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LogOut, Users, Building, Truck, UserPlus, UserMinus, ArrowLeft } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface AdminDashboardProps {
  onNavigateToLanding: () => void;
  incomingRequests: RestaurantApplication[];
  onConsumeIncomingRequests: () => void;
}

interface RestaurantMenuItem {
  name: string;
  image: string;
  price: number;
  availability: 'AVAILABLE' | 'UNAVAILABLE';
}

interface RestaurantOpeningHour {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

interface ActiveRestaurantSummary {
  id: string;
  name: string;
  cuisine: string;
  status: 'online' | 'offline';
}

export interface RestaurantApplication {
  id: string;
  name: string;
  image?: string;
  streetAddress: string;
  phoneNumbers: string[];
  contactPerson: string;
  email: string;
  openingHours: RestaurantOpeningHour[];
  menu: RestaurantMenuItem[];
}

function formatTime(time: string) {
  const [hoursStr, minutes] = time.split(':');
  let hours = Number(hoursStr);
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) {
    hours = 12;
  }
  return `${hours}:${minutes} ${period}`;
}

export function AdminDashboard({ onNavigateToLanding, incomingRequests, onConsumeIncomingRequests }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'restaurants' | 'staff' | 'drivers'>('overview');
  
  const [pendingRestaurants, setPendingRestaurants] = useState<RestaurantApplication[]>([
    {
      id: "1",
      name: "Bella Italia",
      image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f",
      streetAddress: "1200 Market Street, San Francisco, CA 94102",
      phoneNumbers: ['4155550198', '4155552874'],
      contactPerson: "Marco Romano",
      email: "marco@bellaitalia.com",
      openingHours: [
        { day: 'Monday', open: '10:00', close: '22:00', closed: false },
        { day: 'Tuesday', open: '10:00', close: '22:00', closed: false },
        { day: 'Wednesday', open: '10:00', close: '22:00', closed: false },
        { day: 'Thursday', open: '10:00', close: '23:00', closed: false },
        { day: 'Friday', open: '10:00', close: '23:30', closed: false },
        { day: 'Saturday', open: '11:00', close: '23:30', closed: false },
        { day: 'Sunday', open: '11:00', close: '21:00', closed: false }
      ],
      menu: [
        {
          name: 'Margherita Pizza',
          image: 'https://images.unsplash.com/photo-1548365328-5b0b2d3b4435',
          price: 16.5,
          availability: 'AVAILABLE'
        },
        {
          name: 'Truffle Fettuccine',
          image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e',
          price: 21.0,
          availability: 'AVAILABLE'
        },
        {
          name: 'Tiramisu',
          image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0',
          price: 8.5,
          availability: 'UNAVAILABLE'
        }
      ]
    },
    {
      id: "2",
      name: "Sushi Zen",
      image: "https://images.unsplash.com/photo-1553621042-f6e147245754",
      streetAddress: "500 Pine Street, Seattle, WA 98101",
      phoneNumbers: ['2065550142'],
      contactPerson: "Akira Tanaka",
      email: "akira@sushizen.com",
      openingHours: [
        { day: 'Monday', open: '11:30', close: '21:30', closed: false },
        { day: 'Tuesday', open: '11:30', close: '21:30', closed: false },
        { day: 'Wednesday', open: '11:30', close: '21:30', closed: false },
        { day: 'Thursday', open: '11:30', close: '22:00', closed: false },
        { day: 'Friday', open: '11:30', close: '22:30', closed: false },
        { day: 'Saturday', open: '12:00', close: '22:30', closed: false },
        { day: 'Sunday', open: '12:00', close: '21:00', closed: false }
      ],
      menu: [
        {
          name: 'Cherry Blossom Roll',
          image: 'https://images.unsplash.com/photo-1553621042-f6e147245754',
          price: 14.0,
          availability: 'AVAILABLE'
        },
        {
          name: 'Salmon Nigiri',
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
          price: 4.5,
          availability: 'AVAILABLE'
        },
        {
          name: 'Matcha Cheesecake',
          image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b',
          price: 7.5,
          availability: 'UNAVAILABLE'
        }
      ]
    }
  ]);


  useEffect(() => {
    if (incomingRequests.length === 0) {
      return;
    }

    setPendingRestaurants(prev => {
      const existingIds = new Set(prev.map(r => r.id));
      const additions = incomingRequests.filter(req => !existingIds.has(req.id));
      if (additions.length === 0) {
        return prev;
      }

      onConsumeIncomingRequests();
      return [...additions, ...prev];
    });
  }, [incomingRequests, onConsumeIncomingRequests]);


  const [activeRestaurants] = useState<ActiveRestaurantSummary[]>([
    { id: "101", name: "Sunset Grill", cuisine: "American", status: 'online' },
    { id: "102", name: "Luna Sushi", cuisine: "Japanese", status: 'online' },
    { id: "103", name: "Spice Route", cuisine: "Indian", status: 'offline' },
    { id: "104", name: "Garden Fresh", cuisine: "Vegan", status: 'online' }
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
  const [staffNameError, setStaffNameError] = useState("");
  const [newDriverForm, setNewDriverForm] = useState({ name: "" });
  const [driverNameError, setDriverNameError] = useState("");

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
    const trimmedName = newStaffForm.fullName.trim();

    if (!trimmedName || trimmedName.length < 2) {
      toast.error("Full name must be at least 2 characters");
      return;
    }

    const isDuplicate = staffMembers.some(
      staff => staff.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      setStaffNameError("Name is not unique. Try again.");
      return;
    }

    const lastName = trimmedName.split(' ').pop()?.toLowerCase() || '';
    const randomDigits = Math.floor(10 + Math.random() * 90).toString();
    const username = lastName + randomDigits;

    const newStaff = {
      id: Date.now().toString(),
      name: trimmedName,
      username,
      role: "staff",
      status: "active"
    };

    setStaffMembers(prev => [...prev, newStaff]);
    setNewStaffForm({ fullName: "", username: "", password: "" });
    setStaffNameError("");
    toast.success("Staff Member successfully added to system.");
  };

  const deleteStaff = (id: string) => {
    const staff = staffMembers.find(s => s.id === id);
    if (confirm(`Are you sure you want to delete staff account ${staff?.username}?`)) {
      setStaffMembers(prev => prev.filter(s => s.id !== id));
      toast.success("Staff account deleted");
    }
  };

  const addDriver = () => {
    const trimmedName = newDriverForm.name.trim();

    if (!trimmedName) {
      setDriverNameError("Driver name is required");
      toast.error("Driver name is required");
      return;
    }

    const nameExists = drivers.some(driver => driver.name.toLowerCase() === trimmedName.toLowerCase());
    if (nameExists) {
      setDriverNameError("Name is not unique. Driver already enrolled with this name. Try again.");
      return;
    }

    const newDriver = {
      id: Date.now().toString(),
      name: trimmedName,
      status: "available"
    };

    setDrivers(prev => [...prev, newDriver]);
    setNewDriverForm({ name: "" });
    setDriverNameError("");
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
                    <div className="text-2xl font-bold">{activeRestaurants.filter(restaurant => restaurant.status === 'online').length}</div>
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
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">Active Restaurants Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeRestaurants.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No active restaurants online</p>
                  ) : (
                    activeRestaurants.map((restaurant) => (
                      <div
                        key={restaurant.id}
                        className="flex flex-col gap-3 rounded-lg border border-border p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <h3 className="text-base font-semibold">{restaurant.name}</h3>
                          <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
                        </div>
                        <div className="flex flex-col items-start gap-3 text-sm md:flex-row md:items-center md:gap-4">
                          <Badge variant={restaurant.status === 'online' ? 'default' : 'secondary'} className="capitalize">
                            {restaurant.status === 'online' ? 'Online' : 'Offline'}
                          </Badge>
                          <span className="text-muted-foreground">
                            {restaurant.status === 'online' ? 'Accepting orders' : 'Temporarily paused'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

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
                      pendingRestaurants.map((restaurant) => (
                        <div key={restaurant.id} className="space-y-4 p-4 border border-border rounded-lg">
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex items-start gap-4">
                              {restaurant.image ? (
                                <img
                                  src={restaurant.image}
                                  alt={`${restaurant.name} restaurant`}
                                  className="h-16 w-16 rounded-md object-cover border flex-shrink-0"
                                />
                              ) : (
                                <div className="h-16 w-16 rounded-md border border-dashed flex-shrink-0 flex items-center justify-center text-xs text-muted-foreground">
                                  No Image
                                </div>
                              )}
                              <div className="space-y-1">
                                <h3 className="text-lg font-semibold">{restaurant.name}</h3>
                                <p className="text-sm text-muted-foreground">Contact Person: {restaurant.contactPerson}</p>
                                <p className="text-sm text-muted-foreground">Email: {restaurant.email}</p>
                              </div>
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

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Street Address</Label>
                              <p className="text-sm text-muted-foreground">{restaurant.streetAddress}</p>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Phone Numbers</Label>
                              <div className="flex flex-wrap gap-2">
                                {restaurant.phoneNumbers.map((phone) => (
                                  <Badge key={phone} variant="outline">{phone}</Badge>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Opening Hours</Label>
                              <div className="space-y-1">
                                {restaurant.openingHours.map((hour) => (
                                  <p key={`${restaurant.id}-${hour.day}`} className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">{hour.day}: </span>
                                    {hour.closed ? 'Closed' : `${formatTime(hour.open)} - ${formatTime(hour.close)}`}
                                  </p>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Menu Items</Label>
                              <div className="space-y-2">
                                {restaurant.menu.map((item) => (
                                  <div key={item.name} className="flex items-center gap-3 rounded border border-dashed border-border p-2">
                                    {item.image ? (
                                      <img
                                        src={item.image}
                                        alt={`${item.name} dish`}
                                        className="h-12 w-12 rounded object-cover border"
                                      />
                                    ) : (
                                      <div className="h-12 w-12 rounded border border-dashed flex items-center justify-center text-[10px] text-muted-foreground">
                                        No Image
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">{item.name}</p>
                                      <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} - {item.availability}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
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
                  <div className="space-y-2">
                    <Label>Full Name (must be unique)</Label>
                    <Input
                      value={newStaffForm.fullName}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNewStaffForm(prev => ({ ...prev, fullName: value }));
                        if (staffNameError) {
                          setStaffNameError("");
                        }
                      }}
                      placeholder="John Smith"
                    />
                    {staffNameError && (
                      <p className="text-sm text-red-500">{staffNameError}</p>
                    )}
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
                  <div className="space-y-2">
                    <Label>Driver Name (must be unique)</Label>
                    <Input 
                      value={newDriverForm.name}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNewDriverForm(prev => ({ ...prev, name: value }));
                        if (driverNameError) {
                          setDriverNameError("");
                        }
                      }}
                      placeholder="Mike Wilson"
                    />
                    {driverNameError && (
                      <p className="text-sm text-red-500">{driverNameError}</p>
                    )}
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














import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LogOut, Menu, Settings, Clock, Users, DollarSign, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { DragDropImageUpload } from "./DragDropImageUpload";

interface RestaurantDashboardProps {
  onNavigateToLanding: () => void;
}

type OpeningHoursEntry = {
  day: string;
  open: string;
  close: string;
  closed: boolean;
};

const defaultOpeningHours: OpeningHoursEntry[] = [
  { day: 'Monday', open: '09:00', close: '22:00', closed: false },
  { day: 'Tuesday', open: '09:00', close: '22:00', closed: false },
  { day: 'Wednesday', open: '09:00', close: '22:00', closed: false },
  { day: 'Thursday', open: '09:00', close: '22:00', closed: false },
  { day: 'Friday', open: '09:00', close: '23:00', closed: false },
  { day: 'Saturday', open: '10:00', close: '23:00', closed: false },
  { day: 'Sunday', open: '10:00', close: '21:00', closed: false },
];

export function RestaurantDashboard({ onNavigateToLanding }: RestaurantDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'hours' | 'settings'>('overview');
  const [menuItems, setMenuItems] = useState([
    { id: "1", name: "Margherita Pizza", price: 18.99, available: true, image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca" },
    { id: "2", name: "Pepperoni Pizza", price: 21.99, available: true, image: "https://images.unsplash.com/photo-1628840042765-356cda07504e" },
    { id: "3", name: "Caesar Salad", price: 12.99, available: true, image: "https://images.unsplash.com/photo-1546793665-c74683f339c1" },
    { id: "4", name: "Garlic Bread", price: 8.99, available: false, image: "https://images.unsplash.com/photo-1593527270723-834c53a3fed4" }
  ]);

  const [newItemForm, setNewItemForm] = useState({
    name: "",
    price: "",
    imageUrl: "",
    available: true
  });

  const [openingHours, setOpeningHours] = useState<OpeningHoursEntry[]>(defaultOpeningHours);

  const getSampleFoodImage = () => {
    const sampleImages = [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b", // Pizza
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add", // Burger
      "https://images.unsplash.com/photo-1546833998-877b37c2bc85", // Pasta
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445", // Food
      "https://images.unsplash.com/photo-1567620832903-9fc6debc209f", // Food bowl
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187", // Salad
    ];
    return sampleImages[Math.floor(Math.random() * sampleImages.length)];
  };

  const useSampleImage = () => {
    const imageUrl = getSampleFoodImage();
    setNewItemForm(prev => ({ ...prev, imageUrl }));
    toast.success("Sample food image added!");
  };

  const updateOpeningHours = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setOpeningHours(prev => {
      const updated = [...prev];
      const index = updated.findIndex(entry => entry.day === day);

      if (index === -1) {
        return prev;
      }

      const current = updated[index];

      if (field === 'closed') {
        updated[index] = { ...current, closed: Boolean(value) };
      } else if (field === 'open') {
        updated[index] = { ...current, open: value as string };
      } else if (field === 'close') {
        updated[index] = { ...current, close: value as string };
      }

      return updated;
    });
  };

  const handleLogout = () => {
    toast.success("Logged out successfully");
    onNavigateToLanding();
  };

  const toggleItemAvailability = (id: string) => {
    setMenuItems(prev => prev.map(item => 
      item.id === id ? { ...item, available: !item.available } : item
    ));
    toast.success("Menu item updated");
  };

  const addMenuItem = () => {
    if (!newItemForm.name.trim()) {
      toast.error("Menu item name is required");
      return;
    }

    if (!newItemForm.price || Number(newItemForm.price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      name: newItemForm.name.trim(),
      price: Number(newItemForm.price),
      image: newItemForm.imageUrl.trim() || "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b", // Default food image
      available: newItemForm.available
    };

    setMenuItems(prev => [...prev, newItem]);
    setNewItemForm({ name: "", price: "", imageUrl: "", available: true });
    toast.success("Menu item added successfully");
  };

  const deleteMenuItem = (id: string) => {
    const item = menuItems.find(i => i.id === id);
    if (confirm(`Are you sure you want to delete "${item?.name}"?`)) {
      setMenuItems(prev => prev.filter(i => i.id !== id));
      toast.success("Menu item deleted");
    }
  };

  const handleWithdraw = () => {
    if (confirm("Are you sure you want to withdraw from FrontDash? This action will be reviewed by FrontDash.")) {
      toast.success("Withdrawal request submitted. You will receive confirmation via email.");
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-secondary to-accent py-4 px-6">
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
              <h1 className="text-xl font-bold text-white">Restaurant Dashboard</h1>
              <p className="text-white/80">Tony's Pizza Palace</p>
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
              <DollarSign className="w-4 h-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={activeTab === 'menu' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('menu')}
            >
              <Menu className="w-4 h-4 mr-2" />
              Menu Management
            </Button>
            <Button
              variant={activeTab === 'hours' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('hours')}
            >
              <Clock className="w-4 h-4 mr-2" />
              Opening Hours
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className="bg-green-500 text-white">Open</Badge>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$489.50</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
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
                      <Badge variant="secondary">Delivered</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Menu Management</h2>
              
              {/* Add New Menu Item */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New Menu Item</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="itemName">Item Name *</Label>
                      <Input
                        id="itemName"
                        value={newItemForm.name}
                        onChange={(e) => setNewItemForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Hawaiian Pizza"
                      />
                    </div>
                    <div>
                      <Label htmlFor="itemPrice">Price ($) *</Label>
                      <Input
                        id="itemPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newItemForm.price}
                        onChange={(e) => setNewItemForm(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Item Image</Label>
                    <DragDropImageUpload
                      onImageSelect={(imageUrl) => setNewItemForm(prev => ({ ...prev, imageUrl }))}
                      currentImage={newItemForm.imageUrl}
                      onUseSample={useSampleImage}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="itemAvailable"
                      checked={newItemForm.available}
                      onChange={(e) => setNewItemForm(prev => ({ ...prev, available: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="itemAvailable">Available immediately</Label>
                  </div>
                  
                  <Button onClick={addMenuItem} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Menu Item
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Menu Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Menu Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {menuItems.map(item => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg border flex-shrink-0"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={item.available ? "default" : "secondary"}>
                            {item.available ? "Available" : "Unavailable"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleItemAvailability(item.id)}
                          >
                            Toggle
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteMenuItem(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Opening Hours</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle>Current Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {openingHours.map((entry) => (
                      <div key={entry.day} className="grid grid-cols-4 gap-4 items-center">
                        <Label className="font-medium">{entry.day}</Label>
                        <Input
                          type="time"
                          value={entry.open}
                          onChange={(e) => updateOpeningHours(entry.day, 'open', e.target.value)}
                          disabled={entry.closed}
                          className="text-sm"
                        />
                        <Input
                          type="time"
                          value={entry.close}
                          onChange={(e) => updateOpeningHours(entry.day, 'close', e.target.value)}
                          disabled={entry.closed}
                          className="text-sm"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={entry.closed}
                            onChange={(e) => updateOpeningHours(entry.day, 'closed', e.target.checked)}
                            className="rounded"
                          />
                          <Label className="text-sm">Closed</Label>
                        </div>
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
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Restaurant Name</Label>
                    <Input defaultValue="Tony's Pizza Palace" />
                  </div>
                  <div>
                    <Label>Contact Person</Label>
                    <Input defaultValue="Tony Rossi" />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input defaultValue="5551234567" />
                  </div>
                  <div>
                    <Label>Email Address</Label>
                    <Input defaultValue="contact@tonyspizza.com" />
                  </div>
                  <Button>Update Information</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Password Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Current Password</Label>
                    <Input type="password" />
                  </div>
                  <div>
                    <Label>New Password</Label>
                    <Input type="password" />
                  </div>
                  <div>
                    <Label>Confirm New Password</Label>
                    <Input type="password" />
                  </div>
                  <Button>Change Password</Button>
                </CardContent>
              </Card>

              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Withdraw from FrontDash. This action requires approval and cannot be undone immediately.
                  </p>
                  <Button variant="destructive" onClick={handleWithdraw}>
                    Withdraw from FrontDash
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
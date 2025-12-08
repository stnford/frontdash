import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LogOut, Menu, Settings, Clock, Users, DollarSign, ArrowLeft, Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { api } from "../lib/api";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { DragDropImageUpload } from "./DragDropImageUpload";

interface RestaurantDashboardProps {
  onNavigateToLanding: () => void;
  initialRestaurantName?: string;
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

export function RestaurantDashboard({ onNavigateToLanding, initialRestaurantName }: RestaurantDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'hours' | 'settings'>('overview');
  const [menuItems, setMenuItems] = useState<
    { id: string; name: string; price: number; available: boolean; image: string }[]
  >([]);

  const [newItemForm, setNewItemForm] = useState({
    name: "",
    price: "",
    imageUrl: "",
    available: true
  });
  const [editingMenuItemId, setEditingMenuItemId] = useState<string | null>(null);
  const [editingMenuItemForm, setEditingMenuItemForm] = useState({
    name: "",
    price: "",
    imageUrl: "",
    available: true
  });
  const [restaurantName, setRestaurantName] = useState(initialRestaurantName || "All Chicken Meals");
  const [contactPerson, setContactPerson] = useState("Laura Wimbleton");
  const [phoneNumber, setPhoneNumber] = useState("6174783785");
  const [emailAddress, setEmailAddress] = useState("allchicken@frontdash.test");
  const [accountUpdateMessage, setAccountUpdateMessage] = useState("");
  const [accountUpdateError, setAccountUpdateError] = useState("");

  const [orders, setOrders] = useState<any[]>([]);
  const [orderSummaries, setOrderSummaries] = useState<Record<number, any>>({});

  const [openingHours, setOpeningHours] = useState<OpeningHoursEntry[]>(defaultOpeningHours);

  useEffect(() => {
    if (initialRestaurantName) {
      setRestaurantName(initialRestaurantName);
    }
  }, [initialRestaurantName]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const all = await api.listOrders();
        const byRest = (all as any[]).filter((o) => o.restName === restaurantName);
        setOrders(byRest);
        const summaries = await Promise.all(
          byRest.map(async (o) => {
            try {
              const summary = await api.getOrderSummary(o.orderNumber);
              return [o.orderNumber, summary] as const;
            } catch {
              return [o.orderNumber, null] as const;
            }
          })
        );
        const summaryMap: Record<number, any> = {};
        for (const [num, summary] of summaries) {
          if (summary) summaryMap[num] = summary;
        }
        setOrderSummaries(summaryMap);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load orders");
      }
    };
    if (restaurantName) {
      void loadOrders();
    }
  }, [restaurantName]);

  const summary = useMemo(() => {
    const revenue = orders.reduce((sum, o) => sum + Number(o.grandTotal || 0), 0);
    return {
      ordersCount: orders.length,
      revenue: revenue.toFixed(2),
      recent: orders.slice(0, 5)
    };
  }, [orders]);

  useEffect(() => {
    const load = async () => {
      try {
        const [menu, hours] = await Promise.all([
          api.getRestaurantMenu(restaurantName),
          api.getRestaurantHours(restaurantName)
        ]);

        setMenuItems(
          (menu as any[]).map((m) => ({
            id: String(m.itemID),
            name: m.itemName,
            price: Number(m.itemPrice),
            available: m.isAvailable === "Y",
            image: getSampleFoodImage()
          }))
        );

        if ((hours as any[]).length > 0) {
          setOpeningHours((hours as any[]).map((h) => ({
            day: h.dayOfWeek,
            open: h.openTime?.slice(0,5) ?? "09:00",
            close: h.closeTime?.slice(0,5) ?? "21:00",
            closed: h.isClosed === "Y"
          })));
        }
      } catch (err: any) {
        toast.error(err?.message || "Failed to load restaurant data");
      }
    };
    void load();
  }, [restaurantName]);

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

  const saveHours = () => {
    const doSave = async () => {
      try {
        for (const entry of openingHours) {
          await api.updateRestaurantHours({
            restName: restaurantName,
            dayOfWeek: entry.day as any,
            openTime: entry.open + ":00",
            closeTime: entry.close + ":00",
            isClosed: entry.closed ? "Y" : "N"
          });
        }
        toast.success("Hours updated");
      } catch (err: any) {
        toast.error(err?.message || "Failed to update hours");
      }
    };
    void doSave();
  };

  const handleLogout = () => {
    toast.success("Logged out successfully");
    onNavigateToLanding();
  };

  const toggleItemAvailability = (id: string) => {
    const target = menuItems.find(item => item.id === id);
    if (!target) return;
    const nextAvailable = !target.available;

    const doUpdate = async () => {
      try {
        await api.updateRestaurantMenuItem({
          restName: restaurantName,
          itemId: Number(id),
          itemName: target.name,
          itemDescription: "",
          itemPrice: target.price,
          isAvailable: nextAvailable ? "Y" : "N"
        });
        setMenuItems(prev => prev.map(item => 
          item.id === id ? { ...item, available: nextAvailable } : item
        ));
        toast.success("Menu item updated");
      } catch (err: any) {
        toast.error(err?.message || "Failed to update menu item");
      }
    };

    void doUpdate();
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

    const doCreate = async () => {
      try {
        const res = await api.createRestaurantMenuItem({
          restName: restaurantName,
          itemName: newItemForm.name.trim(),
          itemDescription: "",
          itemPrice: Number(newItemForm.price),
          isAvailable: newItemForm.available ? "Y" : "N"
        });

        const newItem = {
          id: String(res.itemId),
          name: newItemForm.name.trim(),
          price: Number(newItemForm.price),
          image: newItemForm.imageUrl.trim() || "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b",
          available: newItemForm.available
        };

        setMenuItems(prev => [...prev, newItem]);
        setNewItemForm({ name: "", price: "", imageUrl: "", available: true });
        toast.success("Menu item added successfully");
      } catch (err: any) {
        toast.error(err?.message || "Failed to add menu item");
      }
    };

    void doCreate();
  };

  const startEditingMenuItem = (id: string) => {
    const item = menuItems.find(menuItem => menuItem.id === id);
    if (!item) {
      return;
    }

    setEditingMenuItemId(id);
    setEditingMenuItemForm({
      name: item.name,
      price: item.price.toString(),
      imageUrl: item.image,
      available: item.available
    });
  };

  const cancelEditingMenuItem = () => {
    setEditingMenuItemId(null);
    setEditingMenuItemForm({ name: "", price: "", imageUrl: "", available: true });
  };

  const saveEditingMenuItem = () => {
    if (!editingMenuItemId) {
      return;
    }

    const trimmedName = editingMenuItemForm.name.trim();
    if (!trimmedName) {
      toast.error("Menu item name is required");
      return;
    }

    const parsedPrice = Number(editingMenuItemForm.price);
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const updatedImage = editingMenuItemForm.imageUrl.trim();

    const doUpdate = async () => {
      try {
        await api.updateRestaurantMenuItem({
          restName: restaurantName,
          itemId: Number(editingMenuItemId),
          itemName: trimmedName,
          itemDescription: "",
          itemPrice: parsedPrice,
          isAvailable: editingMenuItemForm.available ? "Y" : "N"
        });

        setMenuItems(prev => prev.map(item =>
          item.id === editingMenuItemId
            ? {
                ...item,
                name: trimmedName,
                price: parsedPrice,
                image: updatedImage || item.image,
                available: editingMenuItemForm.available
              }
            : item
        ));

        toast.success("Menu item updated successfully");
        cancelEditingMenuItem();
      } catch (err: any) {
        toast.error(err?.message || "Failed to update menu item");
      }
    };

    void doUpdate();
  };

  const handleAccountSettingsUpdate = () => {
    const cleanedValue = phoneNumber.replace(/-/g, '').replace(/\s/g, '');
    const numbersOnly = cleanedValue.replace(/[^0-9]/g, '');

    if (numbersOnly.length !== 10) {
      const message = "Phone number must be 10 digits. Try again.";
      toast.error(message);
      setAccountUpdateError(message);
      setAccountUpdateMessage("");
      setPhoneNumber(numbersOnly);
      return;
    }

    setPhoneNumber(numbersOnly);
    setAccountUpdateError("");
    setAccountUpdateMessage("Changes successfully saved.");
  };

  const deleteMenuItem = (id: string) => {
    const item = menuItems.find(i => i.id === id);
    if (confirm(`Are you sure you want to delete "${item?.name}"?`)) {
      setMenuItems(prev => prev.filter(i => i.id !== id));
      if (editingMenuItemId === id) {
        cancelEditingMenuItem();
      }
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
              <p className="text-white/80">{restaurantName}</p>
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
                    <CardTitle className="text-sm font-medium">Orders (all)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary.ordersCount}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Revenue (all)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${summary.revenue}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {summary.recent.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No orders yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {summary.recent.map((order) => {
                        const summaryForOrder = orderSummaries[order.orderNumber];
                        const items = summaryForOrder?.items as any[] | undefined;
                        const desc = items && items.length
                          ? items.map((i) => `${i.itemName} x${i.quantity}`).join(", ")
                          : "No items found";
                        return (
                          <div key={order.orderNumber} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                            <div>
                              <p className="font-medium">Order #{order.orderNumber}</p>
                              <p className="text-sm text-muted-foreground">
                                {desc}
                              </p>
                            </div>
                            <Badge>{order.orderStatus || "Pending"}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
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
                    {menuItems.map(item => {
                      const isEditing = editingMenuItemId === item.id;
                      const previewImage = isEditing ? (editingMenuItemForm.imageUrl || item.image) : item.image;

                      return (
                        <div key={item.id} className="space-y-4 p-4 border border-border rounded-lg">
                          {isEditing ? (
                            <div className="flex flex-col gap-4">
                              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                                <ImageWithFallback
                                  src={previewImage}
                                  alt={editingMenuItemForm.name || item.name}
                                  className="w-20 h-20 object-cover rounded-lg border flex-shrink-0"
                                />
                                <div className="flex-1 space-y-3">
                                  <div className="space-y-2">
                                    <Label htmlFor={`edit-name-${item.id}`}>Item Name</Label>
                                    <Input
                                      id={`edit-name-${item.id}`}
                                      value={editingMenuItemForm.name}
                                      onChange={(e) => setEditingMenuItemForm(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                      <Label htmlFor={`edit-price-${item.id}`}>Price ($)</Label>
                                      <Input
                                        id={`edit-price-${item.id}`}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editingMenuItemForm.price}
                                        onChange={(e) => setEditingMenuItemForm(prev => ({ ...prev, price: e.target.value }))}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor={`edit-image-${item.id}`}>Image URL</Label>
                                      <Input
                                        id={`edit-image-${item.id}`}
                                        value={editingMenuItemForm.imageUrl}
                                        onChange={(e) => setEditingMenuItemForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      id={`edit-available-${item.id}`}
                                      type="checkbox"
                                      checked={editingMenuItemForm.available}
                                      onChange={(e) => setEditingMenuItemForm(prev => ({ ...prev, available: e.target.checked }))}
                                      className="rounded"
                                    />
                                    <Label htmlFor={`edit-available-${item.id}`}>Available</Label>
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={cancelEditingMenuItem}>
                                  Cancel
                                </Button>
                                <Button size="sm" onClick={saveEditingMenuItem} className="bg-primary hover:bg-primary/90">
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                              <div className="flex items-center gap-4 flex-1">
                                <ImageWithFallback
                                  src={item.image}
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded-lg border flex-shrink-0"
                                />
                                <div className="flex-1">
                                  <h3 className="font-medium">{item.name}</h3>
                                  <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-3">
                                <Badge variant={item.available ? "default" : "secondary"}>
                                  {item.available ? "Available" : "Unavailable"}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEditingMenuItem(item.id)}
                                >
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Edit
                                </Button>
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
                          )}
                        </div>
                      );
                    })}
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
                  <div className="space-y-2">
                    <Label htmlFor="settings-restaurant-name">Restaurant Name</Label>
                    <Input
                      id="settings-restaurant-name"
                      value={restaurantName}
                      onChange={(e) => {
                        setRestaurantName(e.target.value);
                        setAccountUpdateMessage("");
                        setAccountUpdateError("");
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-contact-person">Contact Person</Label>
                    <Input
                      id="settings-contact-person"
                      value={contactPerson}
                      onChange={(e) => {
                        setContactPerson(e.target.value);
                        setAccountUpdateMessage("");
                        setAccountUpdateError("");
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-phone">Phone Number</Label>
                    <Input
                      id="settings-phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        const withoutDashes = e.target.value.replace(/-/g, '');
                        setPhoneNumber(withoutDashes);
                        setAccountUpdateMessage("");
                        setAccountUpdateError("");
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-email">Email Address</Label>
                    <Input
                      id="settings-email"
                      type="email"
                      value={emailAddress}
                      onChange={(e) => {
                        setEmailAddress(e.target.value);
                        setAccountUpdateMessage("");
                        setAccountUpdateError("");
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Button type="button" onClick={handleAccountSettingsUpdate} className="bg-primary hover:bg-primary/90">
                      Update Information
                    </Button>
                    {accountUpdateError && (
                      <p className="text-sm text-red-500">{accountUpdateError}</p>
                    )}
                    {accountUpdateMessage && (
                      <p className="text-sm text-green-600">{accountUpdateMessage}</p>
                    )}
                  </div>
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

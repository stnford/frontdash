import { ChangeEvent, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ArrowLeft, Upload, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner@2.0.3";
import type { RestaurantApplication } from "./AdminDashboard";
import { api } from "../lib/api";

interface RestaurantRegistrationPageProps {
  onNavigateBack: () => void;
  onSubmitRegistration: (application: RestaurantApplication) => void;
}

interface MenuItem {
  name: string;
  price: string;
  availability: 'AVAILABLE' | 'UNAVAILABLE';
}

interface OpeningHours {
  [key: string]: { open: string; close: string; closed: boolean };
}

export function RestaurantRegistrationPage({ onNavigateBack, onSubmitRegistration }: RestaurantRegistrationPageProps) {
  const [formData, setFormData] = useState({
    name: "",
    streetAddress: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    contactPerson: "",
    email: ""
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { name: "", price: "", availability: 'AVAILABLE' as const }
  ]);

  const [restaurantImage, setRestaurantImage] = useState<string | null>(null);
  const [restaurantImageName, setRestaurantImageName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [openingHours, setOpeningHours] = useState<OpeningHours>({
    Monday: { open: "09:00", close: "22:00", closed: false },
    Tuesday: { open: "09:00", close: "22:00", closed: false },
    Wednesday: { open: "09:00", close: "22:00", closed: false },
    Thursday: { open: "09:00", close: "22:00", closed: false },
    Friday: { open: "09:00", close: "23:00", closed: false },
    Saturday: { open: "10:00", close: "23:00", closed: false },
    Sunday: { open: "10:00", close: "21:00", closed: false }
  });

  const addMenuItem = () => {
    setMenuItems([...menuItems, { name: "", price: "", availability: 'AVAILABLE' }]);
  };

  const removeMenuItem = (index: number) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  const updateMenuItem = (index: number, field: keyof MenuItem, value: string) => {
    const updated = [...menuItems];
    updated[index] = { ...updated[index], [field]: value };
    setMenuItems(updated);
  };

  const updateOpeningHours = (day: string, field: string, value: string | boolean) => {
    setOpeningHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setRestaurantImage(null);
      setRestaurantImageName("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setRestaurantImage(reader.result);
        setRestaurantImageName(file.name);
      }
    };
    reader.onerror = () => {
      toast.error("We couldn't read that file. Please try again with a different image.");
      setRestaurantImage(null);
      setRestaurantImageName("");
    };

    reader.readAsDataURL(file);
  };

  const openImagePicker = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Restaurant name is required");
      return;
    }

    if (!formData.phone || formData.phone.length !== 10 || formData.phone[0] === '0') {
      toast.error("Phone number must be 10 digits and cannot start with 0");
      return;
    }

    if (!formData.email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Check if at least one menu item has both name and price
    const validMenuItems = menuItems.filter(item => item.name.trim() && item.price.trim());
    if (validMenuItems.length === 0) {
      toast.error("Please add at least one menu item with name and price");
      return;
    }

    // Simulate submission
    const doSubmit = async () => {
      try {
        await api.registerRestaurant({
          restName: formData.name.trim(),
          streetAddress1: formData.streetAddress.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zip: formData.zip.trim(),
          contactName: formData.contactPerson.trim(),
          contactEmail: formData.email.trim(),
          contactPhone: formData.phone.trim()
        });

        toast.success("Registration request submitted! You will receive login credentials via email once approved.");
        
        const application: RestaurantApplication = {
          id: Date.now().toString(),
          name: formData.name.trim(),
          image: restaurantImage ?? undefined,
          streetAddress: formData.streetAddress.trim(),
          phoneNumbers: [formData.phone],
          contactPerson: formData.contactPerson.trim(),
          email: formData.email.trim(),
          openingHours: Object.entries(openingHours).map(([day, hours]) => ({
            day,
            open: hours.open,
            close: hours.close,
            closed: hours.closed
          })),
          menu: validMenuItems.map(item => ({
            name: item.name.trim(),
            image: "",
            price: parseFloat(item.price) || 0,
            availability: item.availability
          }))
        };

        onSubmitRegistration(application);
      } catch (err: any) {
        toast.error(err?.message || "Failed to submit registration");
      }
    };

    void doSubmit();
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-secondary to-accent py-4 px-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onNavigateBack}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold text-white">Restaurant Registration</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Restaurant Name * (must be unique)</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="streetAddress">Street Address *</Label>
                  <Input
                    id="streetAddress"
                    value={formData.streetAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, streetAddress: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP</Label>
                    <Input
                      id="zip"
                      value={formData.zip}
                      onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number * (10 digits)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setFormData(prev => ({ ...prev, phone: value }));
                      }}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contactPerson">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="picture">Restaurant Picture (optional)</Label>
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2"
                    onClick={openImagePicker}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openImagePicker();
                      }
                    }}
                  >
                    {restaurantImage ? (
                      <div className="space-y-2">
                        <img
                          src={restaurantImage}
                          alt="Selected restaurant"
                          className="mx-auto h-32 w-full object-cover rounded-md"
                        />
                        <p className="text-sm font-medium text-foreground truncate">{restaurantImageName}</p>
                        <p className="text-xs text-muted-foreground">Click to choose a different image</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      </div>
                    )}
                    <div className="mt-4 flex justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          openImagePicker();
                        }}
                      >
                        Choose Image
                      </Button>
                    </div>
                    <input
                      id="picture"
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageSelection}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Opening Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Opening Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(openingHours).map(([day, hours]) => (
                  <div key={day} className="grid grid-cols-4 gap-4 items-center">
                    <Label className="font-medium">{day}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={hours.open}
                        onChange={(e) => updateOpeningHours(day, 'open', e.target.value)}
                        disabled={hours.closed}
                        className="text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={hours.close}
                        onChange={(e) => updateOpeningHours(day, 'close', e.target.value)}
                        disabled={hours.closed}
                        className="text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hours.closed}
                        onChange={(e) => updateOpeningHours(day, 'closed', e.target.checked)}
                        className="rounded"
                      />
                      <Label className="text-sm">Closed</Label>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Menu */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Menu Items</CardTitle>
                  <Button type="button" onClick={addMenuItem} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {menuItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 items-end p-4 border border-border rounded-lg">
                    <div>
                      <Label htmlFor={`item-name-${index}`}>Item Name</Label>
                      <Input
                        id={`item-name-${index}`}
                        value={item.name}
                        onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
                        placeholder="e.g., Margherita Pizza"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`item-price-${index}`}>Price ($)</Label>
                      <Input
                        id={`item-price-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateMenuItem(index, 'price', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`item-availability-${index}`}>Availability</Label>
                      <select
                        id={`item-availability-${index}`}
                        value={item.availability}
                        onChange={(e) => updateMenuItem(index, 'availability', e.target.value as 'AVAILABLE' | 'UNAVAILABLE')}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="UNAVAILABLE">Unavailable</option>
                      </select>
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeMenuItem(index)}
                      size="sm"
                      variant="outline"
                      disabled={menuItems.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Your registration request will be reviewed by FrontDash. You will receive login credentials via email once approved.
              </p>
              <Button type="submit" className="bg-primary hover:bg-primary/90 px-8 py-3 text-lg font-bold">
                Submit Registration Request
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LogOut, Users, Building, Truck, UserPlus, UserMinus, ArrowLeft } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { api } from "../lib/api";

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
  
  const [pendingRestaurants, setPendingRestaurants] = useState<RestaurantApplication[]>([]);
  const [activeRestaurants, setActiveRestaurants] = useState<ActiveRestaurantSummary[]>([]);

  const [staffMembers, setStaffMembers] = useState<
    { id: string; name: string; username: string; role: string; status: string }[]
  >([]);

  const [drivers, setDrivers] = useState<{ id: string; name: string; status: string }[]>([]);

  const [newStaffForm, setNewStaffForm] = useState({ firstName: "", lastName: "", username: "", password: "" });
  const [staffNameError, setStaffNameError] = useState("");
  const [newDriverForm, setNewDriverForm] = useState({ name: "" });
  const [driverNameError, setDriverNameError] = useState("");

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

  useEffect(() => {
    const load = async () => {
      try {
        const [rest, staff, driver, pending] = await Promise.all([
          api.listRestaurants(),
          api.listStaff(),
          api.listDrivers(),
          api.listPendingRestaurants()
        ]);

        setActiveRestaurants(
          rest.map((r: any, idx: number) => ({
            id: r.restName ?? String(idx),
            name: r.restName,
            status: r.isActive === "Y" ? "online" : "offline"
          }))
        );

        setPendingRestaurants(
          pending.map((p: any, idx: number) => ({
            id: p.restName ?? String(idx),
            name: p.restName,
            streetAddress: "",
            phoneNumbers: [p.contactPhone],
            contactPerson: p.contactName,
            email: p.contactEmail,
            openingHours: [],
            menu: []
          }))
        );

        setStaffMembers(
          staff.map((s: any, idx: number) => ({
            id: String(idx),
            name: `${s.firstName} ${s.lastName}`,
            username: s.username,
            role: "staff",
            status: (s.employementStatus || "").toLowerCase()
          }))
        );

        setDrivers(
          driver.map((d: any, idx: number) => ({
            id: String(idx),
            name: d.driverName,
            status: d.employementStatus === "Active" ? "available" : "inactive"
          }))
        );
      } catch (err: any) {
        toast.error(err?.message || "Failed to load admin data");
      }
    };

    void load();
  }, []);

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
    const trimmedFirstName = newStaffForm.firstName.trim();
    const trimmedLastName = newStaffForm.lastName.trim();

    if (!trimmedFirstName || !trimmedLastName) {
      toast.error("First and last name are required");
      return;
    }

    if (trimmedFirstName.length < 2 || trimmedLastName.length < 2) {
      toast.error("Names must be at least 2 characters");
      return;
    }

    const fullName = `${trimmedFirstName} ${trimmedLastName}`.trim();

    const isDuplicate = staffMembers.some(
      staff => staff.name.trim().toLowerCase() === fullName.toLowerCase()
    );

    if (isDuplicate) {
      setStaffNameError("Name is not unique. Try again.");
      return;
    }

    if (!newStaffForm.username.trim() || !newStaffForm.password.trim()) {
      setStaffNameError("Username and password are required");
      return;
    }

    const doCreate = async () => {
      try {
        await api.createStaff({
          username: newStaffForm.username.trim(),
          password: newStaffForm.password.trim(),
          firstName: trimmedFirstName,
          lastName: trimmedLastName
        });
        setStaffMembers(prev => [
          ...prev,
          {
            id: (prev.length + 1).toString(),
            name: fullName,
            username: newStaffForm.username.trim(),
            role: "staff",
            status: "active"
          }
        ]);
        setStaffNameError("");
        setNewStaffForm({ firstName: "", lastName: "", username: "", password: "" });
        toast.success("New staff member added");
      } catch (err: any) {
        toast.error(err?.message || "Failed to add staff");
      }
    };

    void doCreate();
  };

  const toggleStaffStatus = (id: string) => {
    const target = staffMembers.find(s => s.id === id);
    if (!target) return;
    const nextStatus = target.status === "active" ? "Inactive" : "Active";

    const doUpdate = async () => {
      try {
        await api.setStaffStatus(target.username, nextStatus as "Active" | "Inactive");
        setStaffMembers(prev => prev.map(staff => 
          staff.id === id 
            ? { ...staff, status: nextStatus.toLowerCase() }
            : staff
        ));
        toast.success("Staff status updated");
      } catch (err: any) {
        toast.error(err?.message || "Failed to update staff status");
      }
    };

    void doUpdate();
  };

  const addDriver = () => {
    const trimmedName = newDriverForm.name.trim();
    if (!trimmedName) {
      setDriverNameError("Driver name is required");
      return;
    }
    const isDuplicate = drivers.some(
      driver => driver.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      setDriverNameError("Driver name must be unique");
      return;
    }

    const doCreate = async () => {
      try {
        await api.createDriver(trimmedName);
        setDrivers(prev => [...prev, { id: (prev.length + 1).toString(), name: trimmedName, status: "available" }]);
        setDriverNameError("");
        setNewDriverForm({ name: "" });
        toast.success("New driver added");
      } catch (err: any) {
        toast.error(err?.message || "Failed to add driver");
      }
    };

    void doCreate();
  };

  const toggleDriverStatus = (id: string) => {
    const target = drivers.find(d => d.id === id);
    if (!target) return;
    const nextStatus = target.status === "available" ? "Inactive" : "Active";

    const doUpdate = async () => {
      try {
        await api.setDriverStatus(target.name, nextStatus as "Active" | "Inactive");
        setDrivers(prev => prev.map(driver => 
          driver.id === id 
            ? { ...driver, status: nextStatus === "Active" ? "available" : "inactive" }
            : driver
        ));
        toast.success("Driver status updated");
      } catch (err: any) {
        toast.error(err?.message || "Failed to update driver status");
      }
    };

    void doUpdate();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onNavigateToLanding} size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building className="w-6 h-6 text-primary" /> Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'overview' ? "default" : "ghost"}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </Button>
            <Button
              variant={activeTab === 'restaurants' ? "default" : "ghost"}
              onClick={() => setActiveTab('restaurants')}
            >
              Restaurants
            </Button>
            <Button
              variant={activeTab === 'staff' ? "default" : "ghost"}
              onClick={() => setActiveTab('staff')}
            >
              Staff
            </Button>
            <Button
              variant={activeTab === 'drivers' ? "default" : "ghost"}
              onClick={() => setActiveTab('drivers')}
            >
              Drivers
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {activeTab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Pending Restaurants</CardTitle>
                <Badge variant="secondary">{pendingRestaurants.length}</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingRestaurants.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No pending requests right now.</p>
                  ) : pendingRestaurants.map((r) => (
                    <div key={r.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold">{r.name}</p>
                          <p className="text-sm text-muted-foreground">{r.contactPerson}</p>
                          <p className="text-sm text-muted-foreground">{r.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => approveRestaurant(r.id)}>Approve</Button>
                          <Button size="sm" variant="outline" onClick={() => rejectRestaurant(r.id)}>Reject</Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {r.openingHours?.slice(0, 3).map((h, idx) => (
                          <Badge key={idx} variant="outline">{h.day}: {h.closed ? 'Closed' : `${formatTime(h.open)} - ${formatTime(h.close)}`}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Active Restaurants</CardTitle>
                <Badge variant="secondary">{activeRestaurants.length}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeRestaurants.map((r) => (
                  <div key={r.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <p className="font-semibold">{r.name}</p>
                      <p className="text-sm text-muted-foreground">Status: {r.status}</p>
                    </div>
                    <Badge variant={r.status === 'online' ? 'default' : 'secondary'} className="capitalize">
                      {r.status}
                    </Badge>
                  </div>
                ))}
                {activeRestaurants.length === 0 && <p className="text-sm text-muted-foreground">No restaurants loaded.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Staff & Drivers</CardTitle>
                <Badge variant="secondary">{staffMembers.length + drivers.length}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Staff</p>
                  <p className="text-2xl font-bold">{staffMembers.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Drivers</p>
                  <p className="text-2xl font-bold">{drivers.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'restaurants' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                <CardTitle>Restaurants</CardTitle>
              </div>
              <Badge variant="secondary">{activeRestaurants.length} active</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeRestaurants.map(r => (
                <div key={r.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-sm text-muted-foreground">Status: {r.status}</p>
                  </div>
                  <Badge variant={r.status === 'online' ? 'default' : 'secondary'} className="capitalize">
                    {r.status}
                  </Badge>
                </div>
              ))}
              {activeRestaurants.length === 0 && <p className="text-muted-foreground text-sm">No restaurants loaded.</p>}
            </CardContent>
          </Card>
        )}

        {activeTab === 'staff' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <CardTitle>Staff</CardTitle>
                </div>
                <Badge variant="secondary">{staffMembers.length}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {staffMembers.map(staff => (
                  <div key={staff.id} className="border rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{staff.name}</p>
                      <p className="text-sm text-muted-foreground">{staff.username}</p>
                      <Badge variant={staff.status === "active" ? "default" : "secondary"} className="capitalize mt-1">
                        {staff.status}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toggleStaffStatus(staff.id)}>
                      <UserMinus className="w-4 h-4 mr-1" />
                      {staff.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                ))}
                {staffMembers.length === 0 && <p className="text-sm text-muted-foreground">No staff loaded.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5" />Add Staff</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>First name</Label>
                    <Input value={newStaffForm.firstName} onChange={(e) => setNewStaffForm(prev => ({ ...prev, firstName: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Last name</Label>
                    <Input value={newStaffForm.lastName} onChange={(e) => setNewStaffForm(prev => ({ ...prev, lastName: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Username</Label>
                    <Input value={newStaffForm.username} onChange={(e) => setNewStaffForm(prev => ({ ...prev, username: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input type="password" value={newStaffForm.password} onChange={(e) => setNewStaffForm(prev => ({ ...prev, password: e.target.value }))} />
                  </div>
                </div>
                {staffNameError && <p className="text-sm text-destructive">{staffNameError}</p>}
                <Button className="w-full" onClick={addStaff}>Add Staff Member</Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'drivers' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  <CardTitle>Drivers</CardTitle>
                </div>
                <Badge variant="secondary">{drivers.length}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {drivers.map(driver => (
                  <div key={driver.id} className="border rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{driver.name}</p>
                      <Badge variant={driver.status === "available" ? "default" : "secondary"} className="capitalize mt-1">
                        {driver.status}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toggleDriverStatus(driver.id)}>
                      <UserMinus className="w-4 h-4 mr-1" />
                      {driver.status === "available" ? "Inactivate" : "Activate"}
                    </Button>
                  </div>
                ))}
                {drivers.length === 0 && <p className="text-sm text-muted-foreground">No drivers loaded.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5" />Add Driver</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Driver name</Label>
                  <Input value={newDriverForm.name} onChange={(e) => setNewDriverForm({ name: e.target.value })} />
                  {driverNameError && <p className="text-sm text-destructive mt-1">{driverNameError}</p>}
                </div>
                <Button className="w-full" onClick={addDriver}>Add Driver</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

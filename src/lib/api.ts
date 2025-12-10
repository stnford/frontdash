const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

async function fetchJson<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}

export const api = {
  health: () => fetchJson<{ status: string }>("/api/health"),
  staffLogin: (username: string, password: string) =>
    fetchJson<{ success: boolean; role: string; message: string; mustChangePassword?: boolean }>("/api/auth/staff-login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  restaurantLogin: (username: string, password: string) =>
    fetchJson<{ success: boolean; role: string; message: string; mustChangePassword?: boolean }>("/api/auth/restaurant-login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  changePassword: (payload: { username: string; oldPassword: string; newPassword: string; userType: "staff" | "restaurant" }) =>
    fetchJson<{ success: boolean; role: string; message: string }>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  registerRestaurant: (payload: { restName: string; streetAddress1: string; streetAddress2?: string; city: string; state: string; zip: string; contactName: string; contactEmail: string; contactPhone: string }) =>
    fetchJson<{ message: string }>("/api/restaurant/registration", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getRestaurantMenu: (restName: string) =>
    fetchJson<any[]>(`/api/restaurant/menu?restName=${encodeURIComponent(restName)}`),
  getRestaurantHours: (restName: string) =>
    fetchJson<any[]>(`/api/restaurant/hours?restName=${encodeURIComponent(restName)}`),
  updateRestaurantMenuItem: (payload: { restName: string; itemId: number; itemName: string; itemDescription?: string; itemPrice: number; isAvailable: string }) =>
    fetchJson<{ message: string }>("/api/restaurant/menu-item", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  createRestaurantMenuItem: (payload: { restName: string; itemName: string; itemDescription?: string; itemPrice: number; isAvailable: string }) =>
    fetchJson<{ message: string; itemId: number }>("/api/restaurant/menu-item", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteRestaurantMenuItem: (restName: string, itemId: number) =>
    fetchJson<{ message: string }>(`/api/restaurant/menu-item?restName=${encodeURIComponent(restName)}&itemId=${itemId}`, {
      method: "DELETE",
    }),
  updateRestaurantHours: (payload: { restName: string; dayOfWeek: string; openTime: string; closeTime: string; isClosed: string }) =>
    fetchJson<{ message: string }>("/api/restaurant/hours", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  listRestaurants: () =>
    fetchJson<any[]>("/api/admin/restaurants?includeInactive=1"),
  listPendingRestaurants: () =>
    fetchJson<any[]>("/api/admin/restaurants/pending"),
  approveRestaurant: (restName: string, decision: "Approved" | "Rejected") =>
    fetchJson<{ message: string }>("/api/admin/restaurants/approval", {
      method: "POST",
      body: JSON.stringify({ restName, decision }),
    }),
  requestWithdrawalDecision: (restName: string, decision: "Approved" | "Rejected") =>
    fetchJson<{ message: string }>("/api/admin/restaurants/withdrawal", {
      method: "POST",
      body: JSON.stringify({ restName, decision }),
    }),
  listStaff: () => fetchJson<any[]>("/api/admin/staff"),
  createStaff: (payload: { username: string; password: string; firstName: string; lastName: string }) =>
    fetchJson<{ message: string }>("/api/admin/staff", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  setStaffStatus: (username: string, status: "Active" | "Inactive") =>
    fetchJson<{ message: string }>("/api/admin/staff/status", {
      method: "PUT",
      body: JSON.stringify({ username, status }),
    }),
  listDrivers: () => fetchJson<any[]>("/api/admin/drivers"),
  createDriver: (driverName: string) =>
    fetchJson<{ message: string }>("/api/admin/drivers", {
      method: "POST",
      body: JSON.stringify({ driverName }),
    }),
  setDriverStatus: (driverName: string, status: "Active" | "Inactive") =>
    fetchJson<{ message: string }>("/api/admin/drivers/status", {
      method: "PUT",
      body: JSON.stringify({ driverName, status }),
    }),
  createOrder: (payload: {
    restName: string;
    items: { itemId: number; quantity: number }[];
    tipAmount?: number;
    delivery: {
      streetAddress1: string;
      streetAddress2?: string;
      city: string;
      state: string;
      zip?: string;
      contactName: string;
      contactPhone: string;
    };
  }) =>
    fetchJson<{
      orderNumber: number;
      message: string;
      subtotal: number;
      serviceCharge: number;
      tipAmount: number;
      grandTotal: number;
    }>("/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  assignDriver: (orderNumber: number, driverName: string) =>
    fetchJson<{ message: string }>(`/api/orders/${orderNumber}/assign-driver`, {
      method: "POST",
      body: JSON.stringify({ driverName }),
    }),
  markDelivered: (orderNumber: number, date: string, time: string) =>
    fetchJson<{ message: string }>(`/api/orders/${orderNumber}/delivery`, {
      method: "POST",
      body: JSON.stringify({ date, time }),
    }),
  listOrders: () => fetchJson<any[]>("/api/orders"),
  getOrderSummary: (orderNumber: number) =>
    fetchJson<any>(`/api/orders/${orderNumber}`),
};

export type ApiClient = typeof api;

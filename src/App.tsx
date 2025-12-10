import { useCallback, useState } from "react";
import { SimpleHeader } from "./components/SimpleHeader";
import { RestaurantGrid } from "./components/RestaurantGrid";
import { SignInPage } from "./components/SignInPage";
import { RestaurantDetailPage } from "./components/RestaurantDetailPage";
import { CartPage } from "./components/CartPage";
import { PaymentPage } from "./components/PaymentPage";
import { OrderConfirmationPage } from "./components/OrderConfirmationPage";
import { RestaurantRegistrationPage } from "./components/RestaurantRegistrationPage";
import { RegistrationThankYouPage } from "./components/RegistrationThankYouPage";
import { RestaurantDashboard } from "./components/RestaurantDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import type { RestaurantApplication } from "./components/AdminDashboard";
import { StaffDashboard } from "./components/StaffDashboard";
import { LoginForm } from "./components/LoginForm";
import { RestaurantSwitchDialog } from "./components/RestaurantSwitchDialog";

type PageType = 
  | 'landing' 
  | 'signin' 
  | 'restaurant-detail' 
  | 'cart' 
  | 'payment' 
  | 'order-confirmation'
  | 'restaurant-registration'
  | 'restaurant-registration-thank-you'
  | 'restaurant-login'
  | 'admin-login'
  | 'staff-login'
  | 'restaurant-dashboard'
  | 'admin-dashboard'
  | 'staff-dashboard';

type UserType = 'customer' | 'restaurant' | 'admin' | 'staff' | null;

interface CartItem {
  id: string;
  itemId: number;
  name: string;
  price: number;
  quantity: number;
  restaurantName: string;
}

interface Restaurant {
  id: string;
  name: string;
  image: string;
  isOpen: boolean;
  cuisine: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('landing');
  const [userType, setUserType] = useState<UserType>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [loggedInRestaurantName, setLoggedInRestaurantName] = useState<string | null>(null);
  const [restaurantUsername, setRestaurantUsername] = useState<string | null>(null);
  const [staffUsername, setStaffUsername] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [showRestaurantSwitchDialog, setShowRestaurantSwitchDialog] = useState(false);
  const [pendingCartItem, setPendingCartItem] = useState<Omit<CartItem, 'id'> | null>(null);
  const [pendingAdminRestaurantRequests, setPendingAdminRestaurantRequests] = useState<RestaurantApplication[]>([]);
  
  // Navigation functions
  const navigateToSignIn = () => setCurrentPage('signin');
  const navigateToLanding = () => {
    setCurrentPage('landing');
    setUserType(null);
    setSelectedRestaurant(null);
  };
  
  const navigateToRestaurantDetail = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setCurrentPage('restaurant-detail');
  };
  
  const navigateToCart = () => setCurrentPage('cart');
  const navigateToPayment = () => setCurrentPage('payment');
  const navigateToOrderConfirmation = (details: any) => {
    setOrderDetails(details);
    setCartItems([]); // Clear cart after successful order
    setCurrentPage('order-confirmation');
  };
  
  const navigateToRestaurantRegistration = () => setCurrentPage('restaurant-registration');

  const handleRestaurantRegistrationSubmit = (application: RestaurantApplication) => {
    setPendingAdminRestaurantRequests(prev => [...prev, application]);
    setCurrentPage('restaurant-registration-thank-you');
  };

  const handleConsumePendingAdminRequests = useCallback(() => {
    setPendingAdminRestaurantRequests([]);
  }, [setPendingAdminRestaurantRequests]);

  
  const navigateToRestaurantLogin = () => setCurrentPage('restaurant-login');
  const navigateToAdminLogin = () => setCurrentPage('admin-login');
  const navigateToStaffLogin = () => setCurrentPage('staff-login');
  
  const navigateToRestaurantDashboard = (restName?: string) => {
    if (restName) {
      setLoggedInRestaurantName(restName);
    }
    setUserType('restaurant');
    setCurrentPage('restaurant-dashboard');
  };
  
  const navigateToAdminDashboard = () => {
    setUserType('admin');
    setCurrentPage('admin-dashboard');
  };
  
  const navigateToStaffDashboard = () => {
    setUserType('staff');
    setCurrentPage('staff-dashboard');
  };
  
  const addToCart = (item: Omit<CartItem, 'id'>) => {
    // Check if cart is empty or if item is from the same restaurant
    if (cartItems.length === 0 || cartItems[0].restaurantName === item.restaurantName) {
      // Safe to add - either first item or same restaurant
      setCartItems(prev => {
        const existing = prev.find(ci => ci.itemId === item.itemId);
        if (existing) {
          return prev.map(ci => ci.itemId === item.itemId ? { ...ci, quantity: ci.quantity + item.quantity } : ci);
        }
        const newItem = { ...item, id: `${item.itemId}` };
        return [...prev, newItem];
      });
    } else {
      // Different restaurant - show confirmation dialog
      setPendingCartItem(item);
      setShowRestaurantSwitchDialog(true);
    }
  };

  const handleRestaurantSwitch = () => {
    if (pendingCartItem) {
      // Clear cart and add new item
      const newItem = { ...pendingCartItem, id: `${pendingCartItem.itemId}` };
      setCartItems([newItem]);
      setPendingCartItem(null);
    }
    setShowRestaurantSwitchDialog(false);
  };

  const handleRestaurantSwitchCancel = () => {
    setPendingCartItem(null);
    setShowRestaurantSwitchDialog(false);
  };
  
  const updateCartItem = (id: string, quantity: number) => {
    if (quantity === 0) {
      setCartItems(prev => prev.filter(item => item.id !== id));
    } else {
      setCartItems(prev => prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  // Render current page
  switch (currentPage) {
    case 'signin':
      return (
        <SignInPage 
          onNavigateBack={navigateToLanding}
          onNavigateToRestaurantRegistration={navigateToRestaurantRegistration}
          onNavigateToRestaurantLogin={navigateToRestaurantLogin}
          onNavigateToAdminLogin={navigateToAdminLogin}
          onNavigateToStaffLogin={navigateToStaffLogin}
        />
      );
      
    case 'restaurant-detail':
      return (
        <>
          <RestaurantDetailPage 
            restaurant={selectedRestaurant!}
            onNavigateBack={navigateToLanding}
            onNavigateToCart={navigateToCart}
            onAddToCart={addToCart}
            cartItemCount={cartItems.length}
          />
          <RestaurantSwitchDialog
            isOpen={showRestaurantSwitchDialog}
            onClose={handleRestaurantSwitchCancel}
            onConfirm={handleRestaurantSwitch}
            currentRestaurant={cartItems.length > 0 ? cartItems[0].restaurantName : ""}
            newRestaurant={pendingCartItem?.restaurantName || ""}
            itemCount={cartItems.length}
          />
        </>
      );
      
    case 'cart':
      return (
        <CartPage 
          cartItems={cartItems}
          onNavigateBack={() => navigateToRestaurantDetail(selectedRestaurant!)}
          onNavigateToPayment={navigateToPayment}
          onUpdateCartItem={updateCartItem}
        />
      );
      
    case 'payment':
      return (
        <PaymentPage 
          cartItems={cartItems}
          onNavigateBack={navigateToCart}
          onNavigateToOrderConfirmation={navigateToOrderConfirmation}
        />
      );
      
    case 'order-confirmation':
      return (
        <OrderConfirmationPage 
          orderDetails={orderDetails}
          onNavigateToLanding={navigateToLanding}
        />
      );
      
    case 'restaurant-registration':
      return (
        <RestaurantRegistrationPage 
          onNavigateBack={navigateToSignIn}
          onSubmitRegistration={handleRestaurantRegistrationSubmit}
        />
      );
      
    case 'restaurant-registration-thank-you':
      return (
        <RegistrationThankYouPage
          onNavigateToLanding={navigateToLanding}
        />
      );
      
    case 'restaurant-login':
      return (
        <LoginForm 
          title="Restaurant Login"
          userType="restaurant"
          onNavigateBack={navigateToSignIn}
          onLoginSuccess={(username) => {
            const map: Record<string, string> = {
              owner_chicken: "All Chicken Meals",
              owner_pizza: "Pizza Only",
              owner_burger: "Best Burgers",
            };
            const restName = map[username] ?? selectedRestaurant?.name ?? "All Chicken Meals";
            setRestaurantUsername(username);
            navigateToRestaurantDashboard(restName);
          }}
        />
      );
      
    case 'admin-login':
      return (
        <LoginForm 
          title="Admin Login"
          userType="admin"
          onNavigateBack={navigateToSignIn}
          onLoginSuccess={navigateToAdminDashboard}
        />
      );
      
    case 'staff-login':
      return (
        <LoginForm 
          title="FrontDash Staff Login"
          userType="staff"
          onNavigateBack={navigateToSignIn}
          onLoginSuccess={(username) => {
            setStaffUsername(username);
            navigateToStaffDashboard();
          }}
        />
      );
      
    case 'restaurant-dashboard':
      return (
        <RestaurantDashboard 
          onNavigateToLanding={navigateToLanding}
          initialRestaurantName={loggedInRestaurantName ?? selectedRestaurant?.name ?? "All Chicken Meals"}
          username={restaurantUsername || ""}
        />
      );
      
    case 'admin-dashboard':
      return (
        <AdminDashboard 
          onNavigateToLanding={navigateToLanding}
          incomingRequests={pendingAdminRestaurantRequests}
          onConsumeIncomingRequests={handleConsumePendingAdminRequests}
        />
      );
      
    case 'staff-dashboard':
      return (
        <StaffDashboard 
          onNavigateToLanding={navigateToLanding}
          username={staffUsername || ""}
        />
      );
      
    default: // 'landing'

      return (
        <div className="min-h-screen bg-background flex flex-col">
          <SimpleHeader onNavigateToSignIn={navigateToSignIn} />

          <main className="flex-1 flex flex-col">
            {/* Welcome Section */}
            <div className="bg-gradient-to-br from-background via-muted to-secondary/20 py-12">
              <div className="container mx-auto px-4 text-center">
                <h1 className="text-4xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  Welcome to FrontDash
                </h1>
                <p className="text-xl text-muted-foreground">
                  Choose from our featured restaurants
                </p>
              </div>
            </div>

            {/* Restaurants Section */}
            <div className="flex-1 overflow-y-auto">
              <RestaurantGrid onSelectRestaurant={navigateToRestaurantDetail} />
            </div>
          </main>
        </div>
      );
  }
}

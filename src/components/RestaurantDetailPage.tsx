import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, ShoppingCart, Plus, Minus } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Restaurant {
  id: string;
  name: string;
  image: string;
  isOpen: boolean;
  cuisine: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  available: boolean;
  description: string;
}

interface RestaurantDetailPageProps {
  restaurant: Restaurant;
  onNavigateBack: () => void;
  onNavigateToCart: () => void;
  onAddToCart: (item: { name: string; price: number; quantity: number; restaurantName: string }) => void;
  cartItemCount: number;
}

const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Margherita Pizza",
    price: 18.99,
    image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143",
    available: true,
    description: "Fresh mozzarella, tomato sauce, basil"
  },
  {
    id: "2", 
    name: "Pepperoni Pizza",
    price: 21.99,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b",
    available: true,
    description: "Pepperoni, mozzarella, tomato sauce"
  },
  {
    id: "3",
    name: "Caesar Salad",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1",
    available: true,
    description: "Romaine lettuce, parmesan, croutons, caesar dressing"
  },
  {
    id: "4",
    name: "Garlic Bread",
    price: 8.99,
    image: "https://images.unsplash.com/photo-1593527270723-834c53a3fed4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJsaWMlMjBicmVhZCUyMGZvb2R8ZW58MXx8fHwxNzU4NTYyMjAxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    available: false,
    description: "Toasted bread with garlic butter and herbs"
  }
];

export function RestaurantDetailPage({ 
  restaurant, 
  onNavigateBack, 
  onNavigateToCart, 
  onAddToCart,
  cartItemCount 
}: RestaurantDetailPageProps) {
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  const updateQuantity = (itemId: string, change: number) => {
    setItemQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + change)
    }));
  };

  const addItemToCart = (item: MenuItem) => {
    const quantity = itemQuantities[item.id] || 1;
    onAddToCart({
      name: item.name,
      price: item.price,
      quantity,
      restaurantName: restaurant.name
    });
    setItemQuantities(prev => ({ ...prev, [item.id]: 0 }));
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-secondary to-accent py-4 px-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onNavigateBack}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">{restaurant.name}</h1>
            <p className="text-white/80">{restaurant.cuisine}</p>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onNavigateToCart}
            className="text-white hover:bg-white/20 relative"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartItemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-primary text-primary-foreground">
                {cartItemCount}
              </Badge>
            )}
          </Button>
        </div>
      </header>

      {/* Restaurant Status */}
      <div className="bg-muted/50 py-3 px-6 border-b border-border">
        <div className="flex items-center justify-center gap-2">
          <Badge 
            variant={restaurant.isOpen ? "default" : "secondary"}
            className={restaurant.isOpen ? "bg-green-500 text-white" : "bg-gray-500 text-white"}
          >
            {restaurant.isOpen ? "Open Now" : "Closed"}
          </Badge>
          {restaurant.isOpen && (
            <span className="text-sm text-muted-foreground">Delivery available</span>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6">
          <h2 className="text-2xl font-bold mb-6 text-foreground">Menu</h2>
          
          <div className="space-y-4">
            {menuItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Item Image */}
                    <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
                      <ImageWithFallback 
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Item Details */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">{item.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">${item.price}</p>
                            {!item.available && (
                              <Badge variant="secondary" className="mt-1">
                                Unavailable
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Quantity Controls */}
                      {item.available && restaurant.isOpen && (
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, -1)}
                              disabled={!itemQuantities[item.id]}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            
                            <span className="w-8 text-center font-medium">
                              {itemQuantities[item.id] || 0}
                            </span>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => addItemToCart(item)}
                            disabled={!itemQuantities[item.id]}
                            className="bg-primary hover:bg-primary/90"
                          >
                            Add to Cart
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
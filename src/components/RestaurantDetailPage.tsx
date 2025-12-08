import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, ShoppingCart, Plus, Minus } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { api } from "../lib/api";

interface Restaurant {
  id: string;
  name: string;
  image: string;
  isOpen: boolean;
  cuisine: string;
}

interface MenuItem {
  id: number;
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
  onAddToCart: (item: { itemId: number; name: string; price: number; quantity: number; restaurantName: string }) => void;
  cartItemCount: number;
}

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?auto=format&fit=crop&w=800&q=80";

export function RestaurantDetailPage({ 
  restaurant, 
  onNavigateBack, 
  onNavigateToCart, 
  onAddToCart,
  cartItemCount 
}: RestaurantDetailPageProps) {
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const menu = await api.getRestaurantMenu(restaurant.name);
        const mapped: MenuItem[] = menu.map((row) => ({
          id: Number(row.itemID),
          name: row.itemName,
          price: Number(row.itemPrice),
          image: PLACEHOLDER_IMAGE,
          available: row.isAvailable === "Y",
          description: row.itemDescription || "Delicious menu item"
        }));
        setMenuItems(mapped);
      } catch (err: any) {
        console.error(err);
        setError("Unable to load menu for this restaurant.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [restaurant.name]);

  const updateQuantity = (itemId: string, change: number) => {
    setItemQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + change)
    }));
  };

  const addItemToCart = (item: MenuItem) => {
    const quantity = itemQuantities[item.id] || 1;
    onAddToCart({
      itemId: item.id,
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

          {loading && <div className="text-muted-foreground">Loading menu...</div>}
          {error && <div className="text-destructive">{error}</div>}
          
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

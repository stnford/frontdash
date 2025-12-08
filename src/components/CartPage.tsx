import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ArrowLeft, Plus, Minus, Trash2 } from "lucide-react";
import { Separator } from "./ui/separator";

interface CartItem {
  id: string;
  itemId: number;
  name: string;
  price: number;
  quantity: number;
  restaurantName: string;
}

interface CartPageProps {
  cartItems: CartItem[];
  onNavigateBack: () => void;
  onNavigateToPayment: () => void;
  onUpdateCartItem: (id: string, quantity: number) => void;
}

export function CartPage({ cartItems, onNavigateBack, onNavigateToPayment, onUpdateCartItem }: CartPageProps) {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const serviceCharge = subtotal * 0.0825; // 8.25%
  const total = subtotal + serviceCharge;

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
          <h1 className="text-xl font-bold text-white">Your Cart</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Add some delicious items to get started!</p>
              <Button onClick={onNavigateBack} className="bg-primary hover:bg-primary/90">
                Browse Restaurants
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cart Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order from {cartItems[0]?.restaurantName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateCartItem(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          
                          <span className="w-8 text-center">{item.quantity}</span>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateCartItem(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onUpdateCartItem(item.id, 0)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        
                        <div className="w-16 text-right font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Charge (8.25%)</span>
                    <span>${serviceCharge.toFixed(2)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Checkout Button */}
              <Button 
                onClick={onNavigateToPayment}
                className="w-full bg-primary hover:bg-primary/90 py-6 text-lg font-bold"
                size="lg"
              >
                Proceed to Payment
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

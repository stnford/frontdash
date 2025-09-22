import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle, Home } from "lucide-react";
import { Separator } from "./ui/separator";

interface OrderConfirmationPageProps {
  orderDetails: {
    orderNumber: string;
    restaurantName: string;
    orderDate: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }>;
    subtotal: number;
    serviceCharge: number;
    tips: number;
    grandTotal: number;
    deliveryAddress: string;
    contactName: string;
    contactPhone: string;
    estimatedDelivery: string;
  };
  onNavigateToLanding: () => void;
}

export function OrderConfirmationPage({ orderDetails, onNavigateToLanding }: OrderConfirmationPageProps) {
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-500 py-6">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Order Confirmed!</h1>
          </div>
          <p className="text-white/90">Your order has been placed successfully</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="space-y-6">
            {/* Order Number */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6 text-center">
                <h2 className="text-xl font-bold text-foreground mb-2">Order Number</h2>
                <p className="text-3xl font-bold text-primary">{orderDetails.orderNumber}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Estimated delivery: {orderDetails.estimatedDelivery}
                </p>
              </CardContent>
            </Card>

            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Restaurant:</p>
                    <p className="text-muted-foreground">{orderDetails.restaurantName}</p>
                  </div>
                  <div>
                    <p className="font-medium">Order Date:</p>
                    <p className="text-muted-foreground">{orderDetails.orderDate}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-3">Items Ordered:</h3>
                  <div className="space-y-2">
                    {orderDetails.items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${orderDetails.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Charge:</span>
                    <span>${orderDetails.serviceCharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tips:</span>
                    <span>${orderDetails.tips.toFixed(2)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold">
                    <span>Total Paid:</span>
                    <span className="text-primary">${orderDetails.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium text-sm">Delivery Address:</p>
                  <p className="text-muted-foreground">{orderDetails.deliveryAddress}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-sm">Contact Person:</p>
                    <p className="text-muted-foreground">{orderDetails.contactName}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Phone Number:</p>
                    <p className="text-muted-foreground">{orderDetails.contactPhone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What's Next */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-primary">What's Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Order Processing</p>
                    <p className="text-sm text-muted-foreground">Your order is being prepared at {orderDetails.restaurantName}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Pickup & Delivery</p>
                    <p className="text-sm text-muted-foreground">Our driver will collect and deliver your order</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Enjoy Your Meal!</p>
                    <p className="text-sm text-muted-foreground">Estimated delivery by {orderDetails.estimatedDelivery}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Return to Home */}
            <Button 
              onClick={onNavigateToLanding}
              className="w-full bg-primary hover:bg-primary/90 py-6 text-lg font-bold"
              size="lg"
            >
              <Home className="w-5 h-5 mr-2" />
              Continue Browsing
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
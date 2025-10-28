import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowLeft, CreditCard } from "lucide-react";
import { Separator } from "./ui/separator";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantName: string;
}

interface PaymentPageProps {
  cartItems: CartItem[];
  onNavigateBack: () => void;
  onNavigateToOrderConfirmation: (orderDetails: any) => void;
}

export function PaymentPage({ cartItems, onNavigateBack, onNavigateToOrderConfirmation }: PaymentPageProps) {
  const [tipAmountInput, setTipAmountInput] = useState<string>("");
  const parsedTipAmount = Number.parseFloat(tipAmountInput);
  const tipAmount = Number.isNaN(parsedTipAmount) ? 0 : parsedTipAmount;
  const tipOptions = [18, 20, 25];
  const [paymentForm, setPaymentForm] = useState({
    cardType: "",
    cardNumber: "",
    firstName: "",
    lastName: "",
    billingAddress: "",
    expiryMonth: "",
    expiryYear: "",
    securityCode: ""
  });

  const [deliveryForm, setDeliveryForm] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    contactName: "",
    contactPhone: ""
  });

  const [showDeliveryForm, setShowDeliveryForm] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const serviceCharge = subtotal * 0.0825;
  const grandTotal = subtotal + serviceCharge + tipAmount;

  const handleTipOptionSelect = (percentage: number) => {
    const calculatedTip = (subtotal * percentage) / 100;
    setTipAmountInput(calculatedTip.toFixed(2));
  };

  const isTipOptionSelected = (percentage: number) => {
    if (!tipAmountInput) {
      return false;
    }
    const calculatedTip = Number(((subtotal * percentage) / 100).toFixed(2));
    const currentTip = Number.parseFloat(tipAmountInput);
    if (Number.isNaN(currentTip)) {
      return false;
    }
    return Math.abs(currentTip - calculatedTip) < 0.01;
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!paymentForm.cardNumber || paymentForm.cardNumber.length !== 16) {
      alert("Please enter a valid 16-digit card number");
      return;
    }
    
    if (!paymentForm.securityCode || paymentForm.securityCode.length !== 3) {
      alert("Please enter a valid 3-digit security code");
      return;
    }

    // Simulate payment processing
    setShowDeliveryForm(true);
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!deliveryForm.contactPhone || deliveryForm.contactPhone.length !== 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    // Generate order details
    const orderDetails = {
      orderNumber: Math.random().toString(36).substr(2, 9).toUpperCase(),
      restaurantName: cartItems[0]?.restaurantName,
      orderDate: new Date().toLocaleString(),
      items: cartItems,
      subtotal,
      serviceCharge,
      tips: tipAmount,
      grandTotal,
      deliveryAddress: `${deliveryForm.addressLine1}${deliveryForm.addressLine2 ? ', ' + deliveryForm.addressLine2 : ''}, ${deliveryForm.city}, ${deliveryForm.state}`,
      contactName: deliveryForm.contactName,
      contactPhone: deliveryForm.contactPhone,
      estimatedDelivery: new Date(Date.now() + 45 * 60000).toLocaleTimeString() // 45 minutes from now
    };

    onNavigateToOrderConfirmation(orderDetails);
  };

  if (showDeliveryForm) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <header className="bg-gradient-to-r from-secondary to-accent py-4 px-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowDeliveryForm(false)}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-xl font-bold text-white">Delivery Address</h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6 max-w-2xl">
            <form onSubmit={handleDeliverySubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="addressLine1">Address Line 1</Label>
                    <Input
                      id="addressLine1"
                      value={deliveryForm.addressLine1}
                      onChange={(e) => setDeliveryForm(prev => ({ ...prev, addressLine1: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="addressLine2">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      value={deliveryForm.addressLine2}
                      onChange={(e) => setDeliveryForm(prev => ({ ...prev, addressLine2: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={deliveryForm.city}
                        onChange={(e) => setDeliveryForm(prev => ({ ...prev, city: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={deliveryForm.state}
                        onChange={(e) => setDeliveryForm(prev => ({ ...prev, state: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contactName">Contact Person Name *</Label>
                    <Input
                      id="contactName"
                      value={deliveryForm.contactName}
                      onChange={(e) => setDeliveryForm(prev => ({ ...prev, contactName: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactPhone">Contact Phone Number * (10 digits)</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      maxLength={10}
                      value={deliveryForm.contactPhone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setDeliveryForm(prev => ({ ...prev, contactPhone: value }));
                      }}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 py-6 text-lg font-bold">
                Complete Order
              </Button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
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
          <h1 className="text-xl font-bold text-white">Payment</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Service Charge (8.25%)</span>
                  <span>${serviceCharge.toFixed(2)}</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Label htmlFor="tips" className="whitespace-nowrap">Tips</Label>
                    <div className="flex flex-wrap gap-2">
                      {tipOptions.map((option) => (
                        <Button
                          key={option}
                          type="button"
                          size="sm"
                          variant={isTipOptionSelected(option) ? "default" : "outline"}
                          onClick={() => handleTipOptionSelect(option)}
                          className="px-3"
                        >
                          {option}%
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      id="tips"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={tipAmountInput}
                      onChange={(e) => setTipAmountInput(e.target.value)}
                      placeholder="Enter tip"
                      className="w-24 text-right"
                    />
                    <span className="flex-1 min-w-0 text-sm text-muted-foreground leading-snug">
                      Your tip goes directly to your driver. No hassle!
                    </span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Grand Total</span>
                  <span className="text-primary">${grandTotal.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Credit Card Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cardType">Card Type *</Label>
                    <Select value={paymentForm.cardType} onValueChange={(value) => setPaymentForm(prev => ({ ...prev, cardType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select card type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visa">VISA</SelectItem>
                        <SelectItem value="mastercard">MasterCard</SelectItem>
                        <SelectItem value="discover">Discover</SelectItem>
                        <SelectItem value="amex">American Express</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="cardNumber">Card Number * (16 digits)</Label>
                    <Input
                      id="cardNumber"
                      maxLength={16}
                      value={paymentForm.cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setPaymentForm(prev => ({ ...prev, cardNumber: value }));
                      }}
                      placeholder="1234567890123456"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={paymentForm.firstName}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={paymentForm.lastName}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="billingAddress">Billing Address *</Label>
                    <Input
                      id="billingAddress"
                      value={paymentForm.billingAddress}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, billingAddress: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="expiryMonth">Expiry Month *</Label>
                      <Select value={paymentForm.expiryMonth} onValueChange={(value) => setPaymentForm(prev => ({ ...prev, expiryMonth: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 12}, (_, i) => (
                            <SelectItem key={i} value={String(i + 1).padStart(2, '0')}>
                              {String(i + 1).padStart(2, '0')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="expiryYear">Expiry Year *</Label>
                      <Select value={paymentForm.expiryYear} onValueChange={(value) => setPaymentForm(prev => ({ ...prev, expiryYear: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="YYYY" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 10}, (_, i) => (
                            <SelectItem key={i} value={String(2025 + i)}>
                              {2025 + i}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="securityCode">Security Code * (3 digits)</Label>
                      <Input
                        id="securityCode"
                        maxLength={3}
                        value={paymentForm.securityCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setPaymentForm(prev => ({ ...prev, securityCode: value }));
                        }}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 py-6 text-lg font-bold">
                Process Payment
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

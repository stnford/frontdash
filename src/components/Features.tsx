import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, Shield, Heart, Zap, MapPin, CreditCard } from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Lightning Fast",
    description: "Get your favorite meals delivered in under 30 minutes",
    color: "text-primary",
    bgColor: "bg-primary/10"
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "Your data and payments are protected with enterprise-grade security",
    color: "text-accent",
    bgColor: "bg-accent/10"
  },
  {
    icon: Heart,
    title: "Quality First",
    description: "Partnered with premium restaurants for the best dining experience",
    color: "text-secondary",
    bgColor: "bg-secondary/10"
  },
  {
    icon: Zap,
    title: "Smart Ordering",
    description: "AI-powered recommendations based on your taste preferences",
    color: "text-primary",
    bgColor: "bg-primary/10"
  },
  {
    icon: MapPin,
    title: "Real-Time Tracking",
    description: "Track your order from kitchen to doorstep in real-time",
    color: "text-accent",
    bgColor: "bg-accent/10"
  },
  {
    icon: CreditCard,
    title: "Flexible Payments",
    description: "Multiple payment options including digital wallets and cash",
    color: "text-secondary",
    bgColor: "bg-secondary/10"
  }
];

export function Features() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-secondary/20 border-secondary text-secondary-foreground px-4 py-2">
            Why Choose FrontDash
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Features That Make Us Special
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We've crafted every detail to ensure your food delivery experience is seamless, 
            delicious, and memorable.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/50 backdrop-blur-sm hover:bg-white/80">
              <CardContent className="p-8">
                <div className={`${feature.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
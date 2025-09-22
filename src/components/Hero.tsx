import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ChefHat, Star, Users, Clock } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Hero() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-muted to-secondary/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23f39c12%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2236%22%20cy%3D%2236%22%20r%3D%226%22/%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
      
      <div className="container mx-auto px-4 py-16 relative">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <Badge variant="outline" className="mb-6 bg-secondary/20 border-secondary text-secondary-foreground px-4 py-2">
              <ChefHat className="w-4 h-4 mr-2" />
              Welcome to FrontDash
            </Badge>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent leading-tight">
              Taste the Future of Dining
            </h1>
            
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-2xl">
              Experience culinary excellence at your fingertips. Discover, order, and savor the best flavors from local restaurants with our intuitive food delivery platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg">
                Start Your Journey
              </Button>
              <Button variant="outline" size="lg" className="border-accent text-accent hover:bg-accent hover:text-white px-8 py-6 text-lg">
                Explore Menu
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto lg:mx-0">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-5 h-5 text-secondary mr-1" />
                  <span className="text-2xl font-bold text-primary">4.9</span>
                </div>
                <p className="text-sm text-muted-foreground">Rating</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-secondary mr-1" />
                  <span className="text-2xl font-bold text-primary">50K+</span>
                </div>
                <p className="text-sm text-muted-foreground">Happy Customers</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-secondary mr-1" />
                  <span className="text-2xl font-bold text-primary">25</span>
                </div>
                <p className="text-sm text-muted-foreground">Min Delivery</p>
              </div>
            </div>
          </div>
          
          {/* Right Content - Hero Image */}
          <div className="flex-1 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1730725419501-72d230321478?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWxpY2lvdXMlMjBmb29kJTIwc3ByZWFkJTIwcmVzdGF1cmFudHxlbnwxfHx8fDE3NTc5ODIwNDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Delicious food spread"
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -top-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Live Orders</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">152 active deliveries</p>
            </div>
            
            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-border">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium">Featured</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Premium restaurants</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
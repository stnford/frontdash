import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ChefHat, Menu, User, ShoppingBag } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-xl">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">FrontDash</h1>
              <p className="text-xs text-muted-foreground">Taste the Future</p>
            </div>
          </div>
          
          {/* Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-foreground hover:text-primary transition-colors">
              Home
            </a>
            <a href="#restaurants" className="text-muted-foreground hover:text-primary transition-colors">
              Restaurants
            </a>
            <a href="#menu" className="text-muted-foreground hover:text-primary transition-colors">
              Menu
            </a>
            <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">
              About
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </nav>
          
          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <Badge variant="secondary" className="ml-1 bg-primary text-white">3</Badge>
            </Button>
            
            <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2">
              <User className="w-4 h-4" />
              Sign In
            </Button>
            
            <Button className="bg-primary hover:bg-primary/90">
              Order Now
            </Button>
            
            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
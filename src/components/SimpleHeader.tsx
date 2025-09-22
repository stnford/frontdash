import { Button } from "./ui/button";
import { ChefHat } from "lucide-react";

interface SimpleHeaderProps {
  onNavigateToSignIn: () => void;
}

export function SimpleHeader({ onNavigateToSignIn }: SimpleHeaderProps) {
  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-xl">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">FrontDash</h1>
            </div>
          </div>
          
          {/* Login Button */}
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={onNavigateToSignIn}
          >
            Login
          </Button>
        </div>
      </div>
    </header>
  );
}
import { Button } from "./ui/button";
import { ChefHat, ArrowLeft } from "lucide-react";

interface SignInPageProps {
  onNavigateBack: () => void;
  onNavigateToRestaurantRegistration: () => void;
  onNavigateToRestaurantLogin: () => void;
  onNavigateToAdminLogin: () => void;
  onNavigateToStaffLogin: () => void;
}

export function SignInPage({ 
  onNavigateBack, 
  onNavigateToRestaurantRegistration,
  onNavigateToRestaurantLogin,
  onNavigateToAdminLogin,
  onNavigateToStaffLogin
}: SignInPageProps) {
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-secondary to-accent py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Back Arrow */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/20"
              onClick={onNavigateBack}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">FRONTDASH</h1>
            </div>
            
            {/* Spacer for centering */}
            <div className="w-10"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-br from-background via-muted to-secondary/20 flex items-center justify-center">
        <div className="w-full max-w-lg px-8">
          {/* User Type Selection */}
          <div className="space-y-6 mb-8">
            <h2 className="text-center text-2xl font-bold text-foreground mb-6">Choose User Type</h2>
            
            {/* Restaurant Login */}
            <div className="space-y-3">
              <Button 
                size="lg" 
                onClick={onNavigateToRestaurantLogin}
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground py-6 text-lg font-bold"
              >
                RESTAURANT LOGIN
              </Button>
              <Button 
                size="lg" 
                onClick={onNavigateToRestaurantRegistration}
                className="w-full bg-secondary/20 hover:bg-secondary/30 text-secondary border-2 border-secondary py-4"
              >
                New Restaurant? Register Here
              </Button>
            </div>

            {/* FrontDash Admin and Staff */}
            <div className="space-y-3">
              <Button 
                size="lg" 
                onClick={onNavigateToAdminLogin}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-bold"
              >
                FRONTDASH ADMIN LOGIN
              </Button>
              <Button 
                size="lg" 
                onClick={onNavigateToStaffLogin}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-lg font-bold"
              >
                FRONTDASH STAFF LOGIN
              </Button>
            </div>
          </div>


        </div>
      </main>
    </div>
  );
}

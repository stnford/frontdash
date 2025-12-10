import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ArrowLeft } from "lucide-react";
import { api } from "../lib/api";

interface LoginFormProps {
  title: string;
  userType: 'restaurant' | 'admin' | 'staff';
  onNavigateBack: () => void;
  onLoginSuccess: (username: string) => void;
}

export function LoginForm({ title, userType, onNavigateBack, onLoginSuccess }: LoginFormProps) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation - just check that fields aren't empty
    if (!credentials.username.trim() || !credentials.password.trim()) {
      alert("Please enter both username and password");
      return;
    }

    const doLogin = async () => {
      try {
        const res = userType === 'restaurant'
          ? await api.restaurantLogin(credentials.username, credentials.password)
          : await api.staffLogin(credentials.username, credentials.password);

        if (res.mustChangePassword) {
          const newPass = window.prompt("First-time login: enter a new password (min 6 chars)");
          if (!newPass || newPass.length < 6) {
            alert("Password must be at least 6 characters");
            return;
          }
          await api.changePassword({
            username: credentials.username,
            oldPassword: credentials.password,
            newPassword: newPass,
            userType: userType === "restaurant" ? "restaurant" : "staff"
          });
        }
        onLoginSuccess(credentials.username);
      } catch (err: any) {
        alert(err?.message || "Login failed");
      }
    };

    void doLogin();
  };

  const getDescription = () => {
    switch (userType) {
      case 'restaurant':
        return 'Access your restaurant dashboard to manage menu, orders, and settings';
      case 'admin':
        return 'Access FrontDash admin panel to manage restaurants, staff, and drivers';
      case 'staff':
        return 'Access the FrontDash staff panel to manage orders and operations';
      default:
        return '';
    }
  };

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
          <h1 className="text-xl font-bold text-white">{title}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-br from-background via-muted to-secondary/20 flex items-center justify-center">
        <div className="w-full max-w-md px-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{title}</CardTitle>
              <p className="text-muted-foreground mt-2">
                {getDescription()}
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter your username"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 py-6 text-lg font-bold"
                  size="lg"
                >
                  Sign In
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

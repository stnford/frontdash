import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ShieldCheck, Home } from "lucide-react";

interface RegistrationThankYouPageProps {
  onNavigateToLanding: () => void;
}

export function RegistrationThankYouPage({ onNavigateToLanding }: RegistrationThankYouPageProps) {
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <header className="bg-gradient-to-r from-primary to-secondary py-6">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <ShieldCheck className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Registration Submitted</h1>
          </div>
          <p className="text-white/90">Thanks for your interest in partnering with FrontDash</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-10 max-w-2xl">
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary">What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                A FrontDash administrator will review your application to make sure we have
                everything we need. This review typically takes 1-2 business days.
              </p>
              <p>
                Once your restaurant is approved, we'll email your account credentials and
                onboarding details so you can start receiving orders on FrontDash.
              </p>
              <p>If we need any additional information, a team member will reach out directly.</p>
            </CardContent>
          </Card>

          <div className="mt-10 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              You can return to the home page while we complete the review.
            </p>
            <Button
              onClick={onNavigateToLanding}
              className="bg-primary hover:bg-primary/90 px-8 py-3 text-lg font-bold"
              size="lg"
            >
              <Home className="w-5 h-5 mr-2" />
              Return to Home
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
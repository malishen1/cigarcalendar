import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function SignUp() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [signUpData, setSignUpData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: signUpData.username,
          email: signUpData.email,
          password: signUpData.password,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Sign up failed");
      }
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6 font-sans font-light">
          The Connoisseur's Journal
        </p>
        <h1 className="text-5xl md:text-6xl font-serif font-light mb-6 tracking-wide">
          Cigar Calendar
        </h1>
        <p className="text-sm text-muted-foreground tracking-widest uppercase font-light">
          Join the Community
        </p>
      </div>

      <Card className="w-full max-w-sm p-8">
        <h2 className="text-2xl font-serif font-semibold mb-6">Create Account</h2>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-xs uppercase tracking-widest font-light">Username</Label>
            <Input
              id="username"
              placeholder="Choose a username"
              value={signUpData.username}
              onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
              disabled={isLoading}
              data-testid="input-signup-username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs uppercase tracking-widest font-light">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={signUpData.email}
              onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
              disabled={isLoading}
              data-testid="input-signup-email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs uppercase tracking-widest font-light">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={signUpData.password}
              onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
              disabled={isLoading}
              data-testid="input-signup-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-xs uppercase tracking-widest font-light">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm your password"
              value={signUpData.confirmPassword}
              onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
              disabled={isLoading}
              data-testid="input-signup-confirm-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-signup">
            {isLoading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Already have an account?</p>
          <button
            onClick={() => setLocation("/signin")}
            className="text-xs uppercase tracking-widest font-light text-primary hover:text-primary/80 transition-colors"
            data-testid="link-signin-from-signup"
          >
            Sign In
          </button>
        </div>
      </Card>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function SignIn() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [signInData, setSignInData] = useState({ username: "", password: "" });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: signInData.username,
          password: signInData.password,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Sign in failed");
      }
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: error.message || "Invalid credentials",
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
          Welcome Back
        </p>
      </div>

      <Card className="w-full max-w-sm p-8">
        <h2 className="text-2xl font-serif font-semibold mb-6">Sign In</h2>
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-xs uppercase tracking-widest font-light">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={signInData.username}
              onChange={(e) => setSignInData({ ...signInData, username: e.target.value })}
              disabled={isLoading}
              data-testid="input-signin-username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs uppercase tracking-widest font-light">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={signInData.password}
              onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
              disabled={isLoading}
              data-testid="input-signin-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-signin">
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Don't have an account?</p>
          <button
            onClick={() => setLocation("/signup")}
            className="text-xs uppercase tracking-widest font-light text-primary hover:text-primary/80 transition-colors"
            data-testid="link-signup-from-signin"
          >
            Sign Up
          </button>
        </div>
      </Card>
    </div>
  );
}

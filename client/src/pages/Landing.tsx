import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [signUpData, setSignUpData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [signInData, setSignInData] = useState({ username: "", password: "" });

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
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6 font-sans font-light">
            The Connoisseur's Journal
          </p>
          <h1 className="text-7xl md:text-8xl font-serif font-light mb-6 tracking-wide">
            Cigar Calendar
          </h1>
          <p className="text-sm text-muted-foreground tracking-widest uppercase font-light max-w-sm mx-auto">
            Log · Discover · Connect
          </p>
        </div>

        <div className="w-full max-w-sm">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-none border border-border h-10">
              <TabsTrigger
                value="signin"
                className="rounded-none text-xs uppercase tracking-widest font-light"
                data-testid="tab-signin"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-none text-xs uppercase tracking-widest font-light"
                data-testid="tab-signup"
              >
                Join
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-0">
              <div className="border border-t-0 border-border p-8 space-y-6">
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest font-light text-muted-foreground">
                      Username
                    </Label>
                    <Input
                      type="text"
                      className="rounded-none border-0 border-b border-border bg-transparent focus-visible:ring-0 focus-visible:border-primary px-0 h-9 text-sm font-light"
                      value={signInData.username}
                      onChange={(e) =>
                        setSignInData({
                          ...signInData,
                          username: e.target.value,
                        })
                      }
                      required
                      data-testid="input-signin-username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest font-light text-muted-foreground">
                      Password
                    </Label>
                    <Input
                      type="password"
                      className="rounded-none border-0 border-b border-border bg-transparent focus-visible:ring-0 focus-visible:border-primary px-0 h-9 text-sm font-light"
                      value={signInData.password}
                      onChange={(e) =>
                        setSignInData({
                          ...signInData,
                          password: e.target.value,
                        })
                      }
                      required
                      data-testid="input-signin-password"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-none text-xs uppercase tracking-widest font-light h-11 mt-2"
                    disabled={isLoading}
                    data-testid="button-signin-submit"
                  >
                    {isLoading ? "..." : "Enter"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <div className="border border-t-0 border-border p-8 space-y-6">
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest font-light text-muted-foreground">
                      Username
                    </Label>
                    <Input
                      type="text"
                      className="rounded-none border-0 border-b border-border bg-transparent focus-visible:ring-0 focus-visible:border-primary px-0 h-9 text-sm font-light"
                      value={signUpData.username}
                      onChange={(e) =>
                        setSignUpData({
                          ...signUpData,
                          username: e.target.value,
                        })
                      }
                      required
                      data-testid="input-signup-username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest font-light text-muted-foreground">
                      Email
                    </Label>
                    <Input
                      type="email"
                      className="rounded-none border-0 border-b border-border bg-transparent focus-visible:ring-0 focus-visible:border-primary px-0 h-9 text-sm font-light"
                      value={signUpData.email}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, email: e.target.value })
                      }
                      required
                      data-testid="input-signup-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest font-light text-muted-foreground">
                      Password
                    </Label>
                    <Input
                      type="password"
                      className="rounded-none border-0 border-b border-border bg-transparent focus-visible:ring-0 focus-visible:border-primary px-0 h-9 text-sm font-light"
                      value={signUpData.password}
                      onChange={(e) =>
                        setSignUpData({
                          ...signUpData,
                          password: e.target.value,
                        })
                      }
                      required
                      minLength={6}
                      data-testid="input-signup-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest font-light text-muted-foreground">
                      Confirm Password
                    </Label>
                    <Input
                      type="password"
                      className="rounded-none border-0 border-b border-border bg-transparent focus-visible:ring-0 focus-visible:border-primary px-0 h-9 text-sm font-light"
                      value={signUpData.confirmPassword}
                      onChange={(e) =>
                        setSignUpData({
                          ...signUpData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                      minLength={6}
                      data-testid="input-signup-confirm"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-none text-xs uppercase tracking-widest font-light h-11 mt-2"
                    disabled={isLoading}
                    data-testid="button-signup-submit"
                  >
                    {isLoading ? "..." : "Create Account"}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <p className="mt-16 text-xs text-muted-foreground tracking-widest uppercase font-light">
          Est. 2025 · For the discerning smoker
        </p>
      </div>
    </div>
  );
}

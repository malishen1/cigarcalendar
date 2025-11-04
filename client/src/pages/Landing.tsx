import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cigarette, Calendar, Users, TrendingUp } from "lucide-react";
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
    confirmPassword: ""
  });
  
  const [signInData, setSignInData] = useState({
    username: "",
    password: ""
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: signUpData.username,
          email: signUpData.email,
          password: signUpData.password
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Sign up failed");
      }
      
      toast({
        title: "Account created!",
        description: "Welcome to Cigar Calendar"
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "Please try again",
        variant: "destructive"
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
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: signInData.username,
          password: signInData.password
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Sign in failed");
      }
      
      toast({
        title: "Welcome back!",
        description: "Successfully signed in"
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid credentials",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-semibold font-serif mb-6">
            Cigar Calendar
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track your cigar sessions, discover upcoming releases, and connect with fellow aficionados
          </p>
        </div>

        <div className="max-w-md mx-auto mb-16">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" data-testid="tab-signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <Card>
                <CardHeader>
                  <CardTitle>Sign In to Cigar Calendar</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your collection
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSignIn}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-username">Username</Label>
                      <Input
                        id="signin-username"
                        type="text"
                        placeholder="your_username"
                        value={signInData.username}
                        onChange={(e) => setSignInData({...signInData, username: e.target.value})}
                        required
                        data-testid="input-signin-username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        value={signInData.password}
                        onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                        required
                        data-testid="input-signin-password"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading}
                      data-testid="button-signin-submit"
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Create Your Account</CardTitle>
                  <CardDescription>
                    Join Cigar Calendar to start tracking your collection
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSignUp}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-username">Username</Label>
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="your_username"
                        value={signUpData.username}
                        onChange={(e) => setSignUpData({...signUpData, username: e.target.value})}
                        required
                        data-testid="input-signup-username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                        required
                        data-testid="input-signup-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                        required
                        minLength={6}
                        data-testid="input-signup-password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirm Password</Label>
                      <Input
                        id="signup-confirm"
                        type="password"
                        value={signUpData.confirmPassword}
                        onChange={(e) => setSignUpData({...signUpData, confirmPassword: e.target.value})}
                        required
                        minLength={6}
                        data-testid="input-signup-confirm"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading}
                      data-testid="button-signup-submit"
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <Card className="p-6">
            <Cigarette className="w-10 h-10 mb-4 text-primary" />
            <h3 className="text-xl font-medium mb-2">Log Your Cigars</h3>
            <p className="text-muted-foreground text-sm">
              Keep detailed records of every cigar with ratings, notes, and automatic calendar sync
            </p>
          </Card>

          <Card className="p-6">
            <TrendingUp className="w-10 h-10 mb-4 text-primary" />
            <h3 className="text-xl font-medium mb-2">Track Releases</h3>
            <p className="text-muted-foreground text-sm">
              Stay updated on limited-edition cigars releasing in the UK & Europe
            </p>
          </Card>

          <Card className="p-6">
            <Calendar className="w-10 h-10 mb-4 text-primary" />
            <h3 className="text-xl font-medium mb-2">Discover Events</h3>
            <p className="text-muted-foreground text-sm">
              Find cigar festivals, tastings, and virtual lounges with RSVP tracking
            </p>
          </Card>

          <Card className="p-6">
            <Users className="w-10 h-10 mb-4 text-primary" />
            <h3 className="text-xl font-medium mb-2">Join Community</h3>
            <p className="text-muted-foreground text-sm">
              Share experiences and see what other enthusiasts are enjoying
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

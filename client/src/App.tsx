import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ThemeToggle from "@/components/ThemeToggle";
import Dashboard from "@/pages/Dashboard";
import LogCigar from "@/pages/LogCigar";
import EditCigar from "@/pages/EditCigar";
import Releases from "@/pages/Releases";
import Events from "@/pages/Events";
import Community from "@/pages/Community";
import AI from "@/pages/AI";
import Admin from "@/pages/Admin";
import Profile from "@/pages/Profile";
import Landing from "@/pages/Landing";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import NotFound from "@/pages/not-found";
import Footer from "@/components/Footer";
import {
  Home,
  Plus,
  Archive,
  Calendar,
  Sparkles,
  Users as UsersIcon,
  Wand2,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

function Navigation() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/log", label: "Log", icon: Plus },
    { path: "/vault", label: "Vault", icon: Archive },
    { path: "/releases", label: "New", icon: Sparkles },
    { path: "/events", label: "Events", icon: Calendar },
    { path: "/ai", label: "AI", icon: Wand2 },
    { path: "/community", label: "Social", icon: UsersIcon },
  ];

  return (
    <>
      <header
        style={{ paddingTop: "env(safe-area-inset-top)" }}
        className="border-b border-border sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={() => setLocation("/")}
              className="flex items-center gap-3 px-1 py-1 transition-all"
              data-testid="link-home"
            >
              <div className="w-6 h-6 bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-serif font-light text-sm">
                  C
                </span>
              </div>
              <span className="font-serif font-light text-base tracking-widest hidden sm:inline uppercase">
                Cigar Calendar
              </span>
            </button>

            <nav className="hidden lg:flex items-center gap-6">
              {navItems.map((item) => {
                const isActive = location === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => setLocation(item.path)}
                    className={`text-xs uppercase tracking-widest font-light transition-colors pb-0.5 ${
                      isActive
                        ? "text-foreground border-b border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              {user ? (
                <button
                  className="text-xs uppercase tracking-widest font-light text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  onClick={() => {
                    window.location.href = "/api/logout";
                  }}
                  data-testid="button-logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setLocation("/signin")}
                    className="text-xs uppercase tracking-widest font-light text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="button-nav-signin"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setLocation("/signup")}
                    className="text-xs uppercase tracking-widest font-light text-primary hover:text-primary/80 transition-colors"
                    data-testid="button-nav-signup"
                  >
                    Sign Up
                  </button>
                </>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex h-14">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                />
                <span
                  className={`text-[8px] uppercase tracking-wide leading-tight ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-light">
          Loading
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  return (
    <Switch>
      <Route path="/signin" component={SignIn} />
      <Route path="/signup" component={SignUp} />
      <Route path="/" component={Dashboard} />
      <Route path="/log" component={LogCigar} />
      <Route path="/edit/:id" component={EditCigar} />
      <Route path="/releases" component={Releases} />
      <Route path="/events" component={Events} />
      <Route path="/ai" component={AI} />
      <Route path="/admin" component={Admin} />
      <Route path="/community" component={Community} />
      <Route path="/profile/:username" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div
          className="min-h-screen"
          style={{ paddingBottom: "calc(56px + env(safe-area-inset-bottom))" }}
        >
          <Navigation />
          <Router />
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

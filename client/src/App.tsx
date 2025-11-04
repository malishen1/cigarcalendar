import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ThemeToggle from "@/components/ThemeToggle";
import Dashboard from "@/pages/Dashboard";
import LogCigar from "@/pages/LogCigar";
import History from "@/pages/History";
import Releases from "@/pages/Releases";
import Events from "@/pages/Events";
import Community from "@/pages/Community";
import NotFound from "@/pages/not-found";
import { Home, Plus, History as HistoryIcon, Calendar, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/log", label: "Log", icon: Plus },
    { path: "/history", label: "History", icon: HistoryIcon },
    { path: "/releases", label: "Releases", icon: Sparkles },
    { path: "/events", label: "Events", icon: Calendar },
    { path: "/community", label: "Community", icon: Users },
  ];

  return (
    <>
      <header className="border-b sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <a className="flex items-center gap-2 hover-elevate px-2 py-1 rounded-md transition-all" data-testid="link-home">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-serif font-bold text-lg">C</span>
                </div>
                <span className="font-serif font-semibold text-xl hidden sm:inline">
                  Cigar Tracker
                </span>
              </a>
            </Link>

            <nav className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                return (
                  <Link key={item.path} href={item.path}>
                    <a>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className="gap-2"
                        data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Button>
                    </a>
                  </Link>
                );
              })}
            </nav>

            <ThemeToggle />
          </div>
        </div>
      </header>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="grid grid-cols-6 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <a className="flex flex-col items-center justify-center gap-1 h-full">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {item.label}
                  </span>
                </a>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/log" component={LogCigar} />
      <Route path="/history" component={History} />
      <Route path="/releases" component={Releases} />
      <Route path="/events" component={Events} />
      <Route path="/community" component={Community} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen pb-16 lg:pb-0">
          <Navigation />
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

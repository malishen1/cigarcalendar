import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ThemeToggle from "@/components/ThemeToggle";
import Dashboard from "@/pages/Dashboard";
import LogCigar from "@/pages/LogCigar";
import History from "@/pages/History";
import NotFound from "@/pages/not-found";
import { Home, Plus, History as HistoryIcon, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/log", label: "Log Cigar", icon: Plus },
    { path: "/history", label: "History", icon: HistoryIcon },
    { path: "/calendar", label: "Calendar", icon: Calendar },
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

            <nav className="hidden md:flex items-center gap-2">
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

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <a className="flex flex-col items-center gap-1 px-4 py-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={isActive ? "bg-secondary" : ""}
                    data-testid={`nav-mobile-${item.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <Icon className="w-5 h-5" />
                  </Button>
                  <span className={`text-xs ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
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
      <Route path="/calendar">
        <div className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
            <h1 className="text-5xl md:text-6xl font-semibold font-serif mb-2">
              Calendar View
            </h1>
            <p className="text-muted-foreground mb-8">
              Your cigar sessions synced with Google Calendar
            </p>
            <div className="flex items-center justify-center h-64 border border-dashed rounded-lg">
              <p className="text-muted-foreground">Calendar integration coming soon</p>
            </div>
          </div>
        </div>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen pb-16 md:pb-0">
          <Navigation />
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cigarette, Calendar, Users, TrendingUp } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-semibold font-serif mb-6">
            Cigar Tracker
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track your cigar sessions, discover upcoming releases, and connect with fellow aficionados
          </p>
          <Button
            size="lg"
            className="text-lg px-8"
            onClick={() => {
              window.location.href = "/api/login";
            }}
            data-testid="button-login"
          >
            Sign In to Get Started
          </Button>
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

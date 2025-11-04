import StatsCard from "@/components/StatsCard";
import CigarEntryCard, { type CigarEntry } from "@/components/CigarEntryCard";
import { Button } from "@/components/ui/button";
import { Cigarette, Star, Calendar, TrendingUp, Plus } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const [recentEntries] = useState<CigarEntry[]>([
    {
      id: '1',
      cigarName: 'Montecristo No. 2',
      brand: 'Habanos S.A.',
      rating: 5,
      date: new Date('2025-11-03T19:30:00'),
      notes: 'Exceptional smoke with rich, earthy flavors and hints of coffee and dark chocolate. Perfect draw and even burn throughout.',
      duration: 75,
      strength: 'Medium',
      hasCalendarEvent: true,
    },
    {
      id: '2',
      cigarName: 'Padron 1964 Anniversary',
      brand: 'Padron Cigars',
      rating: 5,
      date: new Date('2025-10-28T20:15:00'),
      notes: 'Complex and refined with notes of cocoa, espresso, and roasted nuts. Incredibly smooth.',
      duration: 90,
      strength: 'Full',
      hasCalendarEvent: true,
    },
    {
      id: '3',
      cigarName: 'Arturo Fuente Hemingway',
      brand: 'Arturo Fuente',
      rating: 4,
      date: new Date('2025-10-20T18:00:00'),
      notes: 'Well-balanced with cedar and cream notes. Great construction and burn.',
      duration: 60,
      strength: 'Medium',
      hasCalendarEvent: false,
    },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-5xl md:text-6xl font-semibold font-serif mb-2">
              Your Humidor
            </h1>
            <p className="text-muted-foreground">
              Track and savor every moment
            </p>
          </div>
          <Button size="lg" className="gap-2" data-testid="button-quick-log">
            <Plus className="w-5 h-5" />
            Quick Log
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatsCard
            title="Total Logged"
            value="42"
            icon={Cigarette}
            subtitle="All time"
          />
          <StatsCard
            title="Average Rating"
            value="4.5"
            icon={Star}
            subtitle="Out of 5 stars"
          />
          <StatsCard
            title="This Month"
            value="8"
            icon={TrendingUp}
            subtitle="November 2025"
          />
          <StatsCard
            title="Calendar Events"
            value="38"
            icon={Calendar}
            subtitle="Synced to Google"
          />
        </div>

        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-semibold font-serif mb-4">
            Recent Sessions
          </h2>
        </div>

        <div className="space-y-4">
          {recentEntries.map((entry) => (
            <CigarEntryCard
              key={entry.id}
              entry={entry}
              onEdit={(id) => console.log('Edit', id)}
              onDelete={(id) => console.log('Delete', id)}
            />
          ))}
        </div>

        {recentEntries.length === 0 && (
          <div className="text-center py-16">
            <Cigarette className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No cigars logged yet</h3>
            <p className="text-muted-foreground mb-6">
              Start tracking your cigar journey today
            </p>
            <Button size="lg" className="gap-2" data-testid="button-log-first">
              <Plus className="w-5 h-5" />
              Log Your First Cigar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

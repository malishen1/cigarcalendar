import StatsCard from "@/components/StatsCard";
import CigarEntryCard, { type CigarEntry } from "@/components/CigarEntryCard";
import { Button } from "@/components/ui/button";
import { Cigarette, Star, Calendar, TrendingUp, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Cigar } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats'],
  });

  const { data: cigars, isLoading: cigarsLoading } = useQuery<Cigar[]>({
    queryKey: ['/api/cigars'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/cigars/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cigars'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Cigar deleted",
        description: "The cigar entry has been removed.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete cigar.",
      });
    }
  });

  const recentCigars = cigars?.slice(0, 5) || [];
  const formattedEntries: CigarEntry[] = recentCigars.map(cigar => ({
    id: cigar.id,
    cigarName: cigar.cigarName,
    brand: cigar.brand || undefined,
    rating: cigar.rating,
    date: new Date(cigar.date),
    notes: cigar.notes || undefined,
    duration: cigar.duration || undefined,
    strength: (cigar.strength as "Mild" | "Medium" | "Full") || undefined,
    hasCalendarEvent: !!cigar.calendarEventId,
  }));

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
          <Button 
            onClick={() => setLocation("/log")}
            size="lg" 
            className="gap-2" 
            data-testid="button-quick-log"
          >
            <Plus className="w-5 h-5" />
            Quick Log
          </Button>
        </div>

        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-card rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatsCard
              title="Total Logged"
              value={stats?.totalCigars || 0}
              icon={Cigarette}
              subtitle="All time"
            />
            <StatsCard
              title="Average Rating"
              value={stats?.avgRating || "0"}
              icon={Star}
              subtitle="Out of 5 stars"
            />
            <StatsCard
              title="This Month"
              value={stats?.thisMonth || 0}
              icon={TrendingUp}
              subtitle={new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            />
            <StatsCard
              title="Calendar Events"
              value={stats?.withCalendar || 0}
              icon={Calendar}
              subtitle="Synced to Google"
            />
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-semibold font-serif mb-4">
            Recent Sessions
          </h2>
        </div>

        {cigarsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-card rounded-lg animate-pulse" />
            ))}
          </div>
        ) : formattedEntries.length > 0 ? (
          <div className="space-y-4">
            {formattedEntries.map((entry) => (
              <CigarEntryCard
                key={entry.id}
                entry={entry}
                onEdit={(id) => console.log('Edit', id)}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Cigarette className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No cigars logged yet</h3>
            <p className="text-muted-foreground mb-6">
              Start tracking your cigar journey today
            </p>
            <Button
              onClick={() => setLocation("/log")}
              size="lg"
              className="gap-2"
              data-testid="button-log-first"
            >
              <Plus className="w-5 h-5" />
              Log Your First Cigar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

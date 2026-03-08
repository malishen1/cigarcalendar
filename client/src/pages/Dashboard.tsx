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
    queryKey: ["/api/stats"],
  });
  const { data: cigars, isLoading: cigarsLoading } = useQuery<Cigar[]>({
    queryKey: ["/api/cigars"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/cigars/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cigars"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Entry removed" });
    },
    onError: () => toast({ variant: "destructive", title: "Failed to delete" }),
  });

  const recentCigars = cigars?.slice(0, 5) || [];
  const formattedEntries: CigarEntry[] = recentCigars.map((cigar) => ({
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
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-12">
        <div className="flex items-end justify-between mb-12 border-b border-border pb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-light mb-3">
              Your Collection
            </p>
            <h1 className="text-5xl md:text-6xl font-serif font-light tracking-wide">
              The Humidor
            </h1>
          </div>
          <Button
            onClick={() => setLocation("/log")}
            className="rounded-none text-xs uppercase tracking-widest font-light h-10 px-6 gap-2"
            data-testid="button-quick-log"
          >
            <Plus className="w-3.5 h-3.5" />
            Log
          </Button>
        </div>

        {statsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-background animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border mb-12">
            {[
              {
                title: "Total Logged",
                value: stats?.totalCigars || 0,
                icon: Cigarette,
                sub: "All time",
              },
              {
                title: "Avg Rating",
                value: stats?.avgRating || "0",
                icon: Star,
                sub: "Out of 5",
              },
              {
                title: "This Month",
                value: stats?.thisMonth || 0,
                icon: TrendingUp,
                sub: new Date().toLocaleDateString("en-GB", { month: "long" }),
              },
              {
                title: "Calendared",
                value: stats?.withCalendar || 0,
                icon: Calendar,
                sub: "Synced",
              },
            ].map((s) => (
              <div key={s.title} className="bg-background p-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-light mb-3">
                  {s.title}
                </p>
                <p className="text-4xl font-serif font-light mb-1">{s.value}</p>
                <p className="text-xs text-muted-foreground font-light">
                  {s.sub}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-light mb-1">
            Recent
          </p>
          <h2 className="text-3xl font-serif font-light tracking-wide">
            Sessions
          </h2>
        </div>

        {cigarsLoading ? (
          <div className="space-y-px bg-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-background animate-pulse" />
            ))}
          </div>
        ) : formattedEntries.length > 0 ? (
          <div className="space-y-4">
            {formattedEntries.map((entry) => (
              <CigarEntryCard
                key={entry.id}
                entry={entry}
                onEdit={(id) => setLocation(`/edit/${id}`)}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border border-border">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-light mb-6">
              Nothing logged yet
            </p>
            <Button
              onClick={() => setLocation("/log")}
              className="rounded-none text-xs uppercase tracking-widest font-light h-10 px-8 gap-2"
              data-testid="button-log-first"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Your First Cigar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

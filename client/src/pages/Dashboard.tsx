import StatsCard from "@/components/StatsCard";
import CigarEntryCard, { type CigarEntry } from "@/components/CigarEntryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Cigarette,
  Star,
  Calendar,
  TrendingUp,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import type { Cigar } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });
  const { data: cigars = [], isLoading: cigarsLoading } = useQuery<Cigar[]>({
    queryKey: ["/api/cigars"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/cigars/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cigars"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Cigar deleted" });
    },
    onError: () => toast({ variant: "destructive", title: "Failed to delete" }),
  });

  const filteredEntries = cigars
    .filter((cigar) => {
      const matchesSearch =
        searchQuery === "" ||
        cigar.cigarName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cigar.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cigar.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRating =
        ratingFilter === "all" ||
        (ratingFilter === "5" && cigar.rating === 5) ||
        (ratingFilter === "4" && cigar.rating >= 4) ||
        (ratingFilter === "3" && cigar.rating >= 3);
      return matchesSearch && matchesRating;
    })
    .sort((a, b) => {
      if (sortBy === "date-desc")
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "date-asc")
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "rating-desc") return b.rating - a.rating;
      if (sortBy === "rating-asc") return a.rating - b.rating;
      return 0;
    });

  const formattedEntries: CigarEntry[] = filteredEntries.map((cigar) => ({
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
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-light mb-2">
              Your Humidor
            </p>
            <h1 className="text-5xl font-serif font-light tracking-wide">
              Dashboard
            </h1>
          </div>
          <Button
            onClick={() => setLocation("/log")}
            size="lg"
            className="gap-2 rounded-none text-xs uppercase tracking-widest font-light"
            data-testid="button-quick-log"
          >
            <Plus className="w-4 h-4" />
            Quick Log
          </Button>
        </div>

        {/* Stats */}
        {statsLoading ? (
          <div className="grid grid-cols-2 gap-3 mb-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-10">
            <StatsCard
              title="Total Logged"
              value={(stats as any)?.totalCigars || 0}
              icon={Cigarette}
              subtitle="All time"
            />
            <StatsCard
              title="Average Rating"
              value={(stats as any)?.avgRating || "0"}
              icon={Star}
              subtitle="Out of 5 stars"
            />
            <StatsCard
              title="This Month"
              value={(stats as any)?.thisMonth || 0}
              icon={TrendingUp}
              subtitle={new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            />
            <StatsCard
              title="Calendar Events"
              value={(stats as any)?.withCalendar || 0}
              icon={Calendar}
              subtitle="Synced to Google"
            />
          </div>
        )}

        {/* History Section */}
        <div className="border-t border-border pt-8 mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-light mb-2">
            All Sessions
          </p>
          <h2 className="text-3xl font-serif font-light tracking-wide mb-6">
            History
          </h2>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap mb-6">
            <div className="flex-1 min-w-[180px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search cigars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-none text-sm"
                data-testid="input-search"
              />
            </div>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger
                className="w-[140px] rounded-none text-xs"
                data-testid="select-rating-filter"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 mr-2" />
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger
                className="w-[140px] rounded-none text-xs"
                data-testid="select-sort"
              >
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="rating-desc">Highest Rated</SelectItem>
                <SelectItem value="rating-asc">Lowest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cigar List */}
        {cigarsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-card animate-pulse" />
            ))}
          </div>
        ) : formattedEntries.length === 0 && searchQuery === "" ? (
          <div className="text-center py-20 border border-border">
            <Cigarette className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-light mb-6">
              No cigars logged yet
            </p>
            <Button
              onClick={() => setLocation("/log")}
              size="lg"
              className="gap-2 rounded-none text-xs uppercase tracking-widest font-light"
              data-testid="button-log-first"
            >
              <Plus className="w-4 h-4" />
              Log Your First Cigar
            </Button>
          </div>
        ) : formattedEntries.length === 0 ? (
          <div className="text-center py-20 border border-border">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-light">
              No results found
            </p>
          </div>
        ) : (
          <>
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
            <div className="text-center py-8 text-xs uppercase tracking-widest text-muted-foreground font-light">
              {filteredEntries.length} of {cigars.length} sessions
            </div>
          </>
        )}
      </div>
    </div>
  );
}

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
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Cigar } from "@shared/schema";

export default function History() {
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cigars = [], isLoading } = useQuery<Cigar[]>({
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

  const filteredEntries = cigars
    .filter((cigar) => {
      const matchesSearch = searchQuery === "" || 
        cigar.cigarName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cigar.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cigar.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRating = ratingFilter === "all" ||
        (ratingFilter === "5" && cigar.rating === 5) ||
        (ratingFilter === "4" && cigar.rating >= 4) ||
        (ratingFilter === "3" && cigar.rating >= 3);
      
      return matchesSearch && matchesRating;
    })
    .sort((a, b) => {
      if (sortBy === "date-desc") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "date-asc") return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "rating-desc") return b.rating - a.rating;
      if (sortBy === "rating-asc") return a.rating - b.rating;
      return 0;
    });

  const formattedEntries: CigarEntry[] = filteredEntries.map(cigar => ({
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
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-semibold font-serif mb-2">
            History
          </h1>
          <p className="text-muted-foreground">
            Browse and search your cigar collection
          </p>
        </div>

        <div className="sticky top-0 z-10 bg-background pb-6 space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search cigars, brands, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-rating-filter">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]" data-testid="select-sort">
                <SelectValue placeholder="Sort by" />
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

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-card rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {formattedEntries.map((entry) => (
                <CigarEntryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={(id) => console.log('Edit', id)}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))}
            </div>

            <div className="text-center py-8 text-muted-foreground">
              Showing {formattedEntries.length} of {cigars.length} cigars
            </div>
          </>
        )}
      </div>
    </div>
  );
}

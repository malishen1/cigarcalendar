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

export default function History() {
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  const [entries] = useState<CigarEntry[]>([
    {
      id: '1',
      cigarName: 'Montecristo No. 2',
      brand: 'Habanos S.A.',
      rating: 5,
      date: new Date('2025-11-03T19:30:00'),
      notes: 'Exceptional smoke with rich, earthy flavors and hints of coffee and dark chocolate.',
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
      notes: 'Complex and refined with notes of cocoa, espresso, and roasted nuts.',
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
      notes: 'Well-balanced with cedar and cream notes.',
      duration: 60,
      strength: 'Medium',
      hasCalendarEvent: false,
    },
    {
      id: '4',
      cigarName: 'Cohiba Behike 52',
      brand: 'Habanos S.A.',
      rating: 5,
      date: new Date('2025-10-15T21:00:00'),
      notes: 'Premium smoke with exceptional complexity and richness.',
      duration: 80,
      strength: 'Full',
      hasCalendarEvent: true,
    },
    {
      id: '5',
      cigarName: 'Oliva Serie V Melanio',
      brand: 'Oliva Cigar Co.',
      rating: 4,
      date: new Date('2025-10-10T19:45:00'),
      notes: 'Bold and flavorful with excellent construction.',
      duration: 70,
      strength: 'Full',
      hasCalendarEvent: true,
    },
    {
      id: '6',
      cigarName: 'Ashton VSG',
      brand: 'Ashton',
      rating: 4,
      date: new Date('2025-10-05T20:30:00'),
      notes: 'Rich and smooth with a satisfying finish.',
      duration: 65,
      strength: 'Medium',
      hasCalendarEvent: true,
    },
  ]);

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

        <div className="grid grid-cols-1 gap-4">
          {entries.map((entry) => (
            <CigarEntryCard
              key={entry.id}
              entry={entry}
              onEdit={(id) => console.log('Edit', id)}
              onDelete={(id) => console.log('Delete', id)}
            />
          ))}
        </div>

        <div className="text-center py-8 text-muted-foreground">
          Showing {entries.length} of {entries.length} cigars
        </div>
      </div>
    </div>
  );
}

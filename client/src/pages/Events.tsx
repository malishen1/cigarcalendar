import EventCard, { type CigarEvent } from "@/components/EventCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Event } from "@shared/schema";

export default function Events() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  const filteredEvents = events.filter((event) => {
    const matchesSearch = searchQuery === "" || 
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "all" || event.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const formattedEvents: CigarEvent[] = filteredEvents.map(event => ({
    id: event.id,
    name: event.name,
    date: new Date(event.date),
    location: event.location,
    type: event.type as any,
    description: event.description || undefined,
    attendees: event.attendees || undefined,
    link: event.link || undefined,
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-semibold font-serif mb-2">
            Events
          </h1>
          <p className="text-muted-foreground">
            Discover cigar festivals, tastings, and virtual lounges
          </p>
        </div>

        <div className="sticky top-0 z-10 bg-background pb-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-events"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-type-filter">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Festival">Festivals</SelectItem>
                <SelectItem value="Virtual Lounge">Virtual Lounges</SelectItem>
                <SelectItem value="Tasting">Tastings</SelectItem>
                <SelectItem value="Release Party">Release Parties</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-card rounded-lg animate-pulse" />
            ))}
          </div>
        ) : formattedEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {formattedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No events found</p>
          </div>
        )}
      </div>
    </div>
  );
}

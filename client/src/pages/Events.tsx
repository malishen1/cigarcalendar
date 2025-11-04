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

export default function Events() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [events] = useState<CigarEvent[]>([
    {
      id: '1',
      name: 'London Cigar Festival 2025',
      date: new Date('2025-12-01T14:00:00'),
      location: 'London, UK',
      type: 'Festival',
      description: 'Annual gathering of cigar enthusiasts featuring tastings, seminars, and exclusive releases.',
      attendees: 250,
      link: '#',
    },
    {
      id: '2',
      name: 'Virtual Lounge: Cuban Heritage Night',
      date: new Date('2025-11-15T19:00:00'),
      location: 'Online',
      type: 'Virtual Lounge',
      description: 'Join fellow aficionados online for a guided tasting of classic Cuban cigars.',
      attendees: 85,
      link: '#',
    },
    {
      id: '3',
      name: 'Davidoff Exclusive Tasting',
      date: new Date('2025-11-22T18:30:00'),
      location: 'Manchester, UK',
      type: 'Tasting',
      description: 'Experience the latest Davidoff releases with expert guidance.',
      attendees: 40,
      link: '#',
    },
    {
      id: '4',
      name: 'Cohiba Anniversary Release Party',
      date: new Date('2025-11-28T20:00:00'),
      location: 'Paris, France',
      type: 'Release Party',
      description: 'Celebrate the launch of the new Cohiba Anniversary edition.',
      attendees: 120,
      link: '#',
    },
    {
      id: '5',
      name: 'Edinburgh Cigar Weekend',
      date: new Date('2025-12-08T10:00:00'),
      location: 'Edinburgh, Scotland',
      type: 'Festival',
      description: 'Two-day celebration featuring masterclasses, tastings, and networking.',
      attendees: 180,
      link: '#',
    },
  ]);

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

        <div className="grid grid-cols-1 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
}

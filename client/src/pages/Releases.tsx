import ReleaseCard, { type CigarRelease } from "@/components/ReleaseCard";
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

export default function Releases() {
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");

  const [releases] = useState<CigarRelease[]>([
    {
      id: '1',
      name: 'Davidoff Year of the Snake 2025',
      brand: 'Davidoff',
      releaseDate: new Date('2025-12-15'),
      region: 'UK & Europe',
      availability: 'Pre-order',
      description: 'Limited edition release celebrating the Year of the Snake with unique blend and packaging.',
      notified: false,
    },
    {
      id: '2',
      name: 'Cohiba Talismán',
      brand: 'Habanos S.A.',
      releaseDate: new Date('2025-11-20'),
      region: 'Europe',
      availability: 'Coming Soon',
      description: 'New vitola in the Cohiba Línea Clásica with exceptional wrapper quality.',
      notified: true,
    },
    {
      id: '3',
      name: 'Arturo Fuente Opus X 2025',
      brand: 'Arturo Fuente',
      releaseDate: new Date('2025-11-10'),
      region: 'UK & Europe',
      availability: 'Limited',
      description: 'Annual limited release of the legendary Opus X line.',
      notified: false,
    },
    {
      id: '4',
      name: 'Padrón 1926 Serie No. 90',
      brand: 'Padrón Cigars',
      releaseDate: new Date('2025-12-01'),
      region: 'UK',
      availability: 'Coming Soon',
      description: 'Celebrating 90 years of excellence with this special edition.',
      notified: false,
    },
    {
      id: '5',
      name: 'Montecristo Línea 1935',
      brand: 'Habanos S.A.',
      releaseDate: new Date('2025-10-28'),
      region: 'Europe',
      availability: 'Released',
      description: 'Premium line commemorating the brand\'s founding year.',
      notified: true,
    },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-semibold font-serif mb-2">
            Release Calendar
          </h1>
          <p className="text-muted-foreground">
            Track limited editions and upcoming releases in the UK & Europe
          </p>
        </div>

        <div className="sticky top-0 z-10 bg-background pb-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search releases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-releases"
              />
            </div>
            
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-region-filter">
                <SelectValue placeholder="Filter by region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="uk">UK Only</SelectItem>
                <SelectItem value="europe">Europe</SelectItem>
                <SelectItem value="uk-europe">UK & Europe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {releases.map((release) => (
            <ReleaseCard
              key={release.id}
              release={release}
              onToggleNotification={(id) => console.log('Toggle notification', id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

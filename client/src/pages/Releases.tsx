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
import { useQuery } from "@tanstack/react-query";
import type { Release } from "@shared/schema";

export default function Releases() {
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");

  const { data: releases = [], isLoading } = useQuery<Release[]>({
    queryKey: ['/api/releases'],
  });

  const filteredReleases = releases.filter((release) => {
    const matchesSearch = searchQuery === "" || 
      release.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      release.brand.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRegion = regionFilter === "all" ||
      (regionFilter === "uk" && release.region.toLowerCase().includes("uk")) ||
      (regionFilter === "europe" && release.region.toLowerCase().includes("europe") && !release.region.toLowerCase().includes("uk")) ||
      (regionFilter === "uk-europe" && (release.region.toLowerCase().includes("uk") || release.region.toLowerCase().includes("europe")));
    
    return matchesSearch && matchesRegion;
  });

  const formattedReleases: CigarRelease[] = filteredReleases.map(release => ({
    id: release.id,
    name: release.name,
    brand: release.brand,
    releaseDate: new Date(release.releaseDate),
    region: release.region,
    availability: release.availability as any,
    description: release.description || undefined,
    notified: false,
  }));

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

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-card rounded-lg animate-pulse" />
            ))}
          </div>
        ) : formattedReleases.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {formattedReleases.map((release) => (
              <ReleaseCard
                key={release.id}
                release={release}
                onToggleNotification={(id) => console.log('Toggle notification', id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No releases found</p>
          </div>
        )}
      </div>
    </div>
  );
}

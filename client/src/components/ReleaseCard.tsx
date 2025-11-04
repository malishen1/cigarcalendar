import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Bell, BellOff } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

export interface CigarRelease {
  id: string;
  name: string;
  brand: string;
  releaseDate: Date;
  region: string;
  availability: "Pre-order" | "Coming Soon" | "Released" | "Limited";
  description?: string;
  notified?: boolean;
}

interface ReleaseCardProps {
  release: CigarRelease;
  onToggleNotification?: (id: string) => void;
}

export default function ReleaseCard({ release, onToggleNotification }: ReleaseCardProps) {
  const [isNotified, setIsNotified] = useState(release.notified || false);

  const handleToggleNotification = () => {
    setIsNotified(!isNotified);
    if (onToggleNotification) {
      onToggleNotification(release.id);
    }
    console.log(`Notification ${!isNotified ? 'enabled' : 'disabled'} for ${release.name}`);
  };

  const availabilityColors = {
    "Pre-order": "default",
    "Coming Soon": "secondary",
    "Released": "default",
    "Limited": "destructive",
  } as const;

  return (
    <Card className="p-6 hover-elevate transition-all">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="text-xl md:text-2xl font-medium font-serif">
              {release.name}
            </h3>
            <Badge variant={availabilityColors[release.availability]}>
              {release.availability}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{release.brand}</p>
        </div>

        <Button
          size="icon"
          variant={isNotified ? "default" : "outline"}
          onClick={handleToggleNotification}
          data-testid={`button-notify-${release.id}`}
        >
          {isNotified ? (
            <Bell className="w-4 h-4" />
          ) : (
            <BellOff className="w-4 h-4" />
          )}
        </Button>
      </div>

      {release.description && (
        <p className="text-sm text-foreground mb-4">{release.description}</p>
      )}

      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {format(release.releaseDate, "MMMM d, yyyy")}
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {release.region}
        </div>
      </div>
    </Card>
  );
}

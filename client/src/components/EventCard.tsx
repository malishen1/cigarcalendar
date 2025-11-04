import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ExternalLink, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface CigarEvent {
  id: string;
  name: string;
  date: Date;
  location: string;
  type: "Festival" | "Virtual Lounge" | "Tasting" | "Release Party";
  description?: string;
  attendees?: number;
  maxCapacity?: number;
  link?: string;
}

interface EventCardProps {
  event: CigarEvent;
}

export default function EventCard({ event }: EventCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const typeColors = {
    "Festival": "default",
    "Virtual Lounge": "secondary",
    "Tasting": "default",
    "Release Party": "default",
  } as const;

  const rsvpMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/events/${event.id}/rsvp`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "RSVP confirmed!",
        description: "You're attending this event.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "RSVP failed",
        description: error?.message || "Event may be at max capacity.",
      });
    }
  });

  const isAtCapacity = event.maxCapacity && event.attendees ? event.attendees >= event.maxCapacity : false;

  return (
    <Card className="p-6 hover-elevate transition-all">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="text-xl md:text-2xl font-medium font-serif">
              {event.name}
            </h3>
            <Badge variant={typeColors[event.type]}>
              {event.type}
            </Badge>
          </div>
        </div>
      </div>

      {event.description && (
        <p className="text-sm text-foreground mb-4">{event.description}</p>
      )}

      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap mb-4">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {format(event.date, "MMMM d, yyyy 'at' h:mm a")}
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {event.location}
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span data-testid={`text-attendees-${event.id}`}>
            {event.attendees || 0}
            {event.maxCapacity && ` / ${event.maxCapacity}`} attending
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {event.maxCapacity && (
          <Button
            variant={isAtCapacity ? "outline" : "default"}
            size="sm"
            className="gap-2"
            onClick={() => rsvpMutation.mutate()}
            disabled={isAtCapacity || rsvpMutation.isPending}
            data-testid={`button-rsvp-${event.id}`}
          >
            <UserPlus className="w-4 h-4" />
            {isAtCapacity ? "Event Full" : rsvpMutation.isPending ? "RSVPing..." : "I'll Attend"}
          </Button>
        )}
        {event.link && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              console.log(`Opening event link: ${event.link}`);
              window.open(event.link, '_blank');
            }}
            data-testid={`button-event-link-${event.id}`}
          >
            <ExternalLink className="w-4 h-4" />
            Learn More
          </Button>
        )}
      </div>
    </Card>
  );
}

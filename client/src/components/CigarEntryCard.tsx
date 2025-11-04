import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StarRating from "./StarRating";
import { Calendar, Clock, Edit, Trash2, Download } from "lucide-react";
import { format } from "date-fns";
import tobaccoTexture from '@assets/generated_images/Premium_tobacco_leaf_texture_271d7cbc.png';

export interface CigarEntry {
  id: string;
  cigarName: string;
  brand?: string;
  rating: number;
  date: Date;
  notes?: string;
  duration?: number;
  strength?: "Mild" | "Medium" | "Full";
  hasCalendarEvent?: boolean;
}

interface CigarEntryCardProps {
  entry: CigarEntry;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function CigarEntryCard({ entry, onEdit, onDelete }: CigarEntryCardProps) {
  return (
    <Card className="overflow-hidden hover-elevate transition-all">
      <div className="flex flex-col md:flex-row">
        <div 
          className="w-full md:w-48 h-32 md:h-auto bg-cover bg-center relative"
          style={{ backgroundImage: `url(${tobaccoTexture})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40" />
        </div>
        
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-xl md:text-2xl font-medium font-serif">
                  {entry.cigarName}
                </h3>
                {entry.hasCalendarEvent && (
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="w-3 h-3" />
                    Synced
                  </Badge>
                )}
              </div>
              {entry.brand && (
                <p className="text-sm text-muted-foreground">{entry.brand}</p>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  window.location.href = `/api/cigars/${entry.id}/download-calendar`;
                }}
                title="Download calendar file for iOS Calendar, Google Calendar, Outlook, etc."
                data-testid={`button-download-calendar-${entry.id}`}
              >
                <Download className="w-4 h-4" />
              </Button>
              {onEdit && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    onEdit(entry.id);
                    console.log(`Edit cigar entry: ${entry.id}`);
                  }}
                  data-testid={`button-edit-${entry.id}`}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    onDelete(entry.id);
                    console.log(`Delete cigar entry: ${entry.id}`);
                  }}
                  data-testid={`button-delete-${entry.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-3 flex-wrap">
            <StarRating value={entry.rating} readonly size="sm" />
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {format(entry.date, "MMM d, yyyy 'at' h:mm a")}
            </div>
            {entry.duration && (
              <span className="text-sm text-muted-foreground">
                {entry.duration} min
              </span>
            )}
            {entry.strength && (
              <Badge variant="secondary">{entry.strength}</Badge>
            )}
          </div>
          
          {entry.notes && (
            <p className="text-sm text-foreground line-clamp-2">{entry.notes}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StarRating from "./StarRating";
import { useState } from "react";
import { Calendar } from "lucide-react";

interface QuickLogFormProps {
  onSubmit?: (data: any) => void;
  defaultValues?: {
    cigarName?: string;
    brand?: string;
    rating?: number;
    date?: Date;
    duration?: number;
    strength?: string;
    notes?: string;
    addToCalendar?: boolean;
  };
  isEdit?: boolean;
}

export default function QuickLogForm({ onSubmit, defaultValues, isEdit }: QuickLogFormProps) {
  const [rating, setRating] = useState(defaultValues?.rating || 0);
  const [cigarName, setCigarName] = useState(defaultValues?.cigarName || "");
  const [brand, setBrand] = useState(defaultValues?.brand || "");
  const [date, setDate] = useState(
    defaultValues?.date 
      ? new Date(defaultValues.date).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [duration, setDuration] = useState(defaultValues?.duration?.toString() || "");
  const [strength, setStrength] = useState(defaultValues?.strength || "");
  const [notes, setNotes] = useState(defaultValues?.notes || "");
  const [addToCalendar, setAddToCalendar] = useState(defaultValues?.addToCalendar ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      cigarName,
      brand,
      rating,
      date: new Date(date),
      duration: duration ? parseInt(duration) : undefined,
      strength,
      notes,
      addToCalendar,
    };
    console.log("Form submitted:", data);
    if (onSubmit) onSubmit(data);
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-3xl font-semibold font-serif mb-6">{isEdit ? "Edit Cigar" : "Log a Cigar"}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="cigarName">Cigar Name *</Label>
          <Input
            id="cigarName"
            value={cigarName}
            onChange={(e) => setCigarName(e.target.value)}
            placeholder="e.g., Montecristo No. 2"
            required
            data-testid="input-cigar-name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g., Habanos S.A."
            data-testid="input-brand"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="date">Date & Time *</Label>
            <Input
              id="date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              data-testid="input-date"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="60"
              min="1"
              data-testid="input-duration"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="strength">Strength</Label>
          <Select value={strength} onValueChange={setStrength}>
            <SelectTrigger id="strength" data-testid="select-strength">
              <SelectValue placeholder="Select strength" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mild">Mild</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Full">Full</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Rating *</Label>
          <div className="flex items-center gap-3">
            <StarRating value={rating} onChange={setRating} size="lg" />
            {rating > 0 && (
              <span className="text-sm text-muted-foreground">
                {rating} / 5 stars
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Tasting Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe the flavors, aroma, draw, and overall experience..."
            className="min-h-32 resize-none"
            data-testid="input-notes"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <Label htmlFor="calendar-toggle" className="cursor-pointer">
                Add to Google Calendar
              </Label>
              <p className="text-xs text-muted-foreground">
                Create a calendar event for this session
              </p>
            </div>
          </div>
          <Switch
            id="calendar-toggle"
            checked={addToCalendar}
            onCheckedChange={setAddToCalendar}
            data-testid="toggle-calendar"
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full md:w-auto md:px-12"
          disabled={!cigarName || rating === 0}
          data-testid="button-submit"
        >
          Log Cigar
        </Button>
      </form>
    </Card>
  );
}

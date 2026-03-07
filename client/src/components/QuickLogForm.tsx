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
import { useState, useRef } from "react";
import { Calendar, MapPin, GlassWater, Camera, X } from "lucide-react";

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
    location?: string;
    pairing?: string;
    flavorTags?: string[];
    photoUrl?: string;
  };
  isEdit?: boolean;
}

const FLAVOR_TAGS = [
  "Cedar",
  "Leather",
  "Chocolate",
  "Coffee",
  "Spice",
  "Earth",
  "Pepper",
  "Nuts",
  "Cream",
  "Floral",
  "Citrus",
  "Toast",
  "Honey",
  "Wood",
  "Smoke",
];

export default function QuickLogForm({
  onSubmit,
  defaultValues,
  isEdit,
}: QuickLogFormProps) {
  const [rating, setRating] = useState(defaultValues?.rating || 0);
  const [cigarName, setCigarName] = useState(defaultValues?.cigarName || "");
  const [brand, setBrand] = useState(defaultValues?.brand || "");
  const [date, setDate] = useState(
    defaultValues?.date
      ? new Date(defaultValues.date).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
  );
  const [duration, setDuration] = useState(
    defaultValues?.duration?.toString() || "",
  );
  const [strength, setStrength] = useState(defaultValues?.strength || "");
  const [notes, setNotes] = useState(defaultValues?.notes || "");
  const [addToCalendar, setAddToCalendar] = useState(
    defaultValues?.addToCalendar ?? true,
  );
  const [location, setLocation] = useState(defaultValues?.location || "");
  const [pairing, setPairing] = useState(defaultValues?.pairing || "");
  const [flavorTags, setFlavorTags] = useState<string[]>(
    defaultValues?.flavorTags || [],
  );
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    defaultValues?.photoUrl || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleFlavor = (tag: string) => {
    setFlavorTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      cigarName,
      brand,
      rating,
      date,
      duration: duration ? parseInt(duration) : undefined,
      strength,
      notes,
      addToCalendar,
      location,
      pairing,
      flavorTags,
      photoUrl: photoPreview,
    };
    if (onSubmit) onSubmit(data);
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-3xl font-semibold font-serif mb-6">
        {isEdit ? "Edit Cigar" : "Log a Cigar"}
      </h2>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Where
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Home, Lounge, Patio..."
              data-testid="input-location"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pairing" className="flex items-center gap-2">
              <GlassWater className="w-4 h-4 text-primary" /> Pairing
            </Label>
            <Input
              id="pairing"
              value={pairing}
              onChange={(e) => setPairing(e.target.value)}
              placeholder="e.g., Bourbon, Espresso..."
              data-testid="input-pairing"
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

        <div className="space-y-3">
          <Label>Flavor Profile</Label>
          <div className="flex flex-wrap gap-2">
            {FLAVOR_TAGS.map((tag) => {
              const active = flavorTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleFlavor(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150
                    ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/40 text-muted-foreground border-border hover:border-primary hover:text-foreground"
                    }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
          {flavorTags.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Selected: {flavorTags.join(", ")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Tasting Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe the draw, burn, and overall experience..."
            className="min-h-24 resize-none"
            maxLength={500}
            data-testid="input-notes"
          />
          <p className="text-xs text-muted-foreground text-right">
            {notes.length}/500
          </p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" /> Photo
          </Label>
          {photoPreview ? (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
              <img
                src={photoPreview}
                alt="Cigar preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setPhotoPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute top-2 right-2 bg-background/80 rounded-full p-1 hover:bg-background transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Camera className="w-6 h-6" />
              <span className="text-sm">Click to add a photo</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
            data-testid="input-photo"
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
          {isEdit ? "Save Changes" : "Log Cigar"}
        </Button>
      </form>
    </Card>
  );
}

import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({ value, onChange, readonly = false, size = "md" }: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };
  
  const displayRating = hoveredRating ?? value;
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayRating;
        
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => {
              if (!readonly && onChange) {
                onChange(star);
                console.log(`Rating set to ${star} stars`);
              }
            }}
            onMouseEnter={() => !readonly && setHoveredRating(star)}
            onMouseLeave={() => !readonly && setHoveredRating(null)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover-elevate'} transition-colors rounded-sm p-1`}
            data-testid={`star-${star}`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled 
                  ? 'fill-primary text-primary' 
                  : 'text-muted-foreground'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

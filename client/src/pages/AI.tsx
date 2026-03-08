import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Loader2, Star, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Cigar } from "@shared/schema";

interface Recommendation {
  name: string;
  brand: string;
  strength: string;
  flavors: string[];
  reason: string;
  rating: string;
}

export default function AI() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const { data: cigars } = useQuery<Cigar[]>({ queryKey: ["/api/cigars"] });

  const generateRecommendations = async () => {
    if (!cigars || cigars.length === 0) return;
    setIsLoading(true);

    const history = cigars.slice(0, 20).map((c) => ({
      name: c.cigarName,
      brand: c.brand,
      rating: c.rating,
      strength: c.strength,
      notes: c.notes,
    }));

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a world-class cigar sommelier. Analyze the user's cigar history and recommend 3 cigars they would love. 
          Respond ONLY with a JSON array, no markdown, no explanation. Format:
          [{"name":"cigar name","brand":"brand name","strength":"Mild/Medium/Full","flavors":["flavor1","flavor2","flavor3"],"reason":"why they'll love it based on their history","rating":"e.g. 93/100"}]`,
          messages: [
            {
              role: "user",
              content: `Based on my cigar history, recommend 3 cigars I would love: ${JSON.stringify(history)}`,
            },
          ],
        }),
      });

      const data = await response.json();
      const text = data.content?.[0]?.text || "[]";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setRecommendations(parsed);
      setHasGenerated(true);
    } catch (err) {
      console.error("AI error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const strengthColor = (strength: string) => {
    if (strength === "Mild") return "bg-green-500/20 text-green-400";
    if (strength === "Medium") return "bg-amber-500/20 text-amber-400";
    return "bg-red-500/20 text-red-400";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-semibold font-serif mb-2">
            AI Sommelier
          </h1>
          <p className="text-muted-foreground">
            Personalised cigar recommendations based on your taste history
          </p>
        </div>

        {!cigars || cigars.length === 0 ? (
          <Card className="p-8 text-center">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No history yet</h3>
            <p className="text-muted-foreground">
              Log at least one cigar to get AI recommendations
            </p>
          </Card>
        ) : (
          <>
            <div className="mb-8 text-center">
              <Button
                onClick={generateRecommendations}
                disabled={isLoading}
                size="lg"
                className="gap-2 px-8"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : hasGenerated ? (
                  <RefreshCw className="w-5 h-5" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                {isLoading
                  ? "Analysing your taste..."
                  : hasGenerated
                  ? "Regenerate"
                  : "Get My Recommendations"}
              </Button>
              {!hasGenerated && (
                <p className="text-xs text-muted-foreground mt-2">
                  Based on your {cigars.length} logged cigar{cigars.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-40 bg-card rounded-lg animate-pulse" />
                ))}
              </div>
            )}

            {!isLoading && recommendations.length > 0 && (
              <div className="space-y-4">
                {recommendations.map((rec, i) => (
                  <Card key={i} className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-xl font-semibold font-serif">{rec.name}</h3>
                        <p className="text-muted-foreground text-sm">{rec.brand}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${strengthColor(rec.strength)}`}>
                          {rec.strength}
                        </span>
                        <div className="flex items-center gap-1 text-primary">
                          <Star className="w-3.5 h-3.5 fill-primary" />
                          <span className="text-sm font-medium">{rec.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {rec.flavors?.map((f, j) => (
                        <span key={j} className="text-xs bg-muted px-2 py-1 rounded-full">
                          {f}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <span className="text-foreground font-medium">Why you'll love it: </span>
                      {rec.reason}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

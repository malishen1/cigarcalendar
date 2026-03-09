import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Recommendation {
  name: string;
  brand: string;
  flavor_profile: string;
  strength: string;
  price_range: string;
  where_to_buy: string;
}

export default function AI() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }
      
      const data = await response.json();
      setRecommendations(data.recommendations || []);
      toast({
        title: "Recommendations ready",
        description: "Here are some cigars tailored for you",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch recommendations. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
          <h1 className="font-serif text-4xl font-bold">AI Sommelier</h1>
        </div>
        <p className="text-muted-foreground">
          Get personalized cigar recommendations powered by Claude AI
        </p>
      </div>

      <Card className="p-8 mb-8">
        <p className="mb-6 text-foreground">
          Our AI Sommelier analyzes your taste preferences and cigar history to suggest new cigars you'll love.
        </p>
        <Button 
          onClick={handleGetRecommendations}
          disabled={isLoading}
          size="lg"
          data-testid="button-get-recommendations"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating recommendations...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Get AI Recommendations
            </>
          )}
        </Button>
      </Card>

      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-serif text-2xl font-semibold mb-4">Your Personalized Picks</h2>
          {recommendations.map((rec, idx) => (
            <Card key={idx} className="p-6" data-testid={`card-recommendation-${idx}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-serif font-semibold text-lg">{rec.name}</h3>
                  <p className="text-muted-foreground">{rec.brand}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Flavor Profile:</span> {rec.flavor_profile}</p>
                <p><span className="font-medium">Strength:</span> {rec.strength}</p>
                <p><span className="font-medium">Price Range:</span> {rec.price_range}</p>
                <p><span className="font-medium">Where to Buy:</span> {rec.where_to_buy}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

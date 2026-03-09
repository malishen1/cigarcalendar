import QuickLogForm from "@/components/QuickLogForm";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation, useRoute } from "wouter";
import type { Cigar } from "@shared/schema";

export default function EditCigar() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/edit/:id");
  const cigarId = params?.id;

  const { data: cigar, isLoading } = useQuery<Cigar>({
    queryKey: [`/api/cigars/${cigarId}`],
    enabled: !!cigarId,
  });

  const updateCigarMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PATCH', `/api/cigars/${cigarId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cigars'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Cigar updated successfully!",
        description: "Your cigar session has been updated.",
      });
      setLocation('/');
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update cigar. Please try again.",
      });
    }
  });

  const handleSubmit = (data: any) => {
    updateCigarMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading cigar details...</p>
        </div>
      </div>
    );
  }

  if (!cigar) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Cigar not found</h2>
          <p className="text-muted-foreground">The cigar you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const defaultValues = {
    cigarName: cigar.cigarName,
    brand: cigar.brand || "",
    rating: cigar.rating,
    date: new Date(cigar.date),
    duration: cigar.duration || undefined,
    strength: cigar.strength || undefined,
    notes: cigar.notes || "",
    addToCalendar: !cigar.calendarEventId,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-semibold font-serif mb-2">
            Edit Cigar Session
          </h1>
          <p className="text-muted-foreground">
            Update your smoking experience details
          </p>
        </div>
        <QuickLogForm onSubmit={handleSubmit} defaultValues={defaultValues} isEdit />
      </div>
    </div>
  );
}

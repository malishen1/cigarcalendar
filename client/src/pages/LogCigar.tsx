import QuickLogForm from "@/components/QuickLogForm";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function LogCigar() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const logCigarMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/cigars', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cigars'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Cigar logged successfully!",
        description: "Your cigar session has been recorded.",
      });
      setLocation('/');
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log cigar. Please try again.",
      });
    }
  });

  const handleSubmit = (data: any) => {
    logCigarMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <QuickLogForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

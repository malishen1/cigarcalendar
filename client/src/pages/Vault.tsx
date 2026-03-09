import CigarEntryCard, { type CigarEntry } from "@/components/CigarEntryCard";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Cigar } from "@shared/schema";

export default function Vault() {
  const { data: cigars = [], isLoading } = useQuery<Cigar[]>({
    queryKey: ['/api/cigars'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading your vault...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold mb-2">Your Cigar Vault</h1>
        <p className="text-muted-foreground">
          {cigars.length} {cigars.length === 1 ? 'cigar' : 'cigars'} in your collection
        </p>
      </div>

      {cigars.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Your vault is empty. Start logging cigars to build your collection.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cigars.map((cigar) => (
            <CigarEntryCard key={cigar.id} cigar={cigar} data-testid={`card-vault-${cigar.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}

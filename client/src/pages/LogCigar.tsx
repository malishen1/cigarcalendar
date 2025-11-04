import QuickLogForm from "@/components/QuickLogForm";

export default function LogCigar() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <QuickLogForm onSubmit={(data) => console.log('Cigar logged:', data)} />
      </div>
    </div>
  );
}

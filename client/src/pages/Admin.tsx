import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Trash2, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import type { Release, Event } from "@shared/schema";

const releaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string().min(1, "Brand is required"),
  releaseDate: z.string().min(1, "Release date is required"),
  region: z.string().min(1, "Region is required"),
  availability: z.enum(["Available", "Limited", "Upcoming"]),
  description: z.string().optional(),
});

const eventSchema = z.object({
  name: z.string().min(1, "Name is required"),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(1, "Location is required"),
  type: z.enum(["Tasting", "Social", "Festival", "Virtual"]),
  description: z.string().optional(),
  maxCapacity: z.string().optional(),
  link: z.string().optional(),
});

type ReleaseFormData = z.infer<typeof releaseSchema>;
type EventFormData = z.infer<typeof eventSchema>;

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"releases" | "events">("releases");
  const { toast } = useToast();

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "cigar2026") {
      setAuthenticated(true);
      setPassword("");
    } else {
      toast({ title: "Invalid password", variant: "destructive" });
      setPassword("");
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-serif font-semibold">Admin Panel</h1>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-4xl font-serif font-semibold mb-8">Admin Panel</h1>
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab("releases")}
            className={`pb-4 px-2 font-medium transition-colors ${activeTab === "releases" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            Releases
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`pb-4 px-2 font-medium transition-colors ${activeTab === "events" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            Events
          </button>
        </div>
        {activeTab === "releases" && <ReleasesSection />}
        {activeTab === "events" && <EventsSection />}
      </div>
    </div>
  );
}

function ReleasesSection() {
  const { toast } = useToast();
  const form = useForm<ReleaseFormData>({
    resolver: zodResolver(releaseSchema),
    defaultValues: {
      name: "",
      brand: "",
      releaseDate: "",
      region: "",
      availability: "Upcoming",
      description: "",
    },
  });

  const { data: releases, isLoading } = useQuery<Release[]>({
    queryKey: ["/api/releases"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: ReleaseFormData) =>
      apiRequest("POST", "/api/releases", {
        ...data,
        releaseDate: new Date(data.releaseDate),
      }),
    onSuccess: () => {
      toast({ title: "Release created!" });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/releases"] });
    },
    onError: () =>
      toast({ title: "Failed to create release", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/releases/${id}`),
    onSuccess: () => {
      toast({ title: "Release deleted!" });
      queryClient.invalidateQueries({ queryKey: ["/api/releases"] });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h2 className="text-2xl font-serif font-semibold mb-6">
          Add New Release
        </h2>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Cigar name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="Brand" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="releaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Release Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. UK & Europe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="availability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Limited">Limited</SelectItem>
                        <SelectItem value="Upcoming">Upcoming</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Add Release
            </Button>
          </form>
        </Form>
      </Card>

      <div>
        <h2 className="text-2xl font-serif font-semibold mb-4">
          Existing Releases
        </h2>
        {isLoading ? (
          <Card className="p-8 text-center text-muted-foreground">
            Loading...
          </Card>
        ) : !releases?.length ? (
          <Card className="p-8 text-center text-muted-foreground">
            No releases yet
          </Card>
        ) : (
          <div className="space-y-3">
            {releases.map((release) => (
              <Card key={release.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{release.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {release.brand} • {release.region} •{" "}
                      {release.availability}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(release.releaseDate).toLocaleDateString()}
                    </p>
                    {release.description && (
                      <p className="text-sm mt-1">{release.description}</p>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteMutation.mutate(release.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EventsSection() {
  const { toast } = useToast();
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "",
      date: "",
      location: "",
      type: "Tasting",
      description: "",
      maxCapacity: "",
      link: "",
    },
  });

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: EventFormData) =>
      apiRequest("POST", "/api/events", {
        name: data.name,
        date: new Date(data.date),
        location: data.location,
        type: data.type,
        description: data.description || null,
        maxCapacity: data.maxCapacity ? parseInt(data.maxCapacity) : null,
        link: data.link || null,
      }),
    onSuccess: () => {
      toast({ title: "Event created!" });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: () =>
      toast({ title: "Failed to create event", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/events/${id}`),
    onSuccess: () => {
      toast({ title: "Event deleted!" });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h2 className="text-2xl font-serif font-semibold mb-6">
          Add New Event
        </h2>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Event name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Tasting">Tasting</SelectItem>
                        <SelectItem value="Social">Social</SelectItem>
                        <SelectItem value="Festival">Festival</SelectItem>
                        <SelectItem value="Virtual">Virtual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxCapacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Capacity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Add Event
            </Button>
          </form>
        </Form>
      </Card>

      <div>
        <h2 className="text-2xl font-serif font-semibold mb-4">
          Existing Events
        </h2>
        {isLoading ? (
          <Card className="p-8 text-center text-muted-foreground">
            Loading...
          </Card>
        ) : !events?.length ? (
          <Card className="p-8 text-center text-muted-foreground">
            No events yet
          </Card>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <Card key={event.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{event.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {event.type} • {event.location}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                    {event.description && (
                      <p className="text-sm mt-1">{event.description}</p>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteMutation.mutate(event.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

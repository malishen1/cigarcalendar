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
import type {
  Release,
  Event,
  CommunityPost,
  PostComment,
} from "@shared/schema";

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
  const [activeTab, setActiveTab] = useState<
    "releases" | "events" | "community"
  >("releases");
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
            <h1 className="text-3xl font-serif font-light">Admin Panel</h1>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-light text-muted-foreground">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-none"
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-none text-xs uppercase tracking-widest font-light"
            >
              Enter
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-10">
        <h1 className="text-4xl font-serif font-light tracking-wide mb-10">
          Admin Panel
        </h1>
        <div className="flex gap-6 mb-10 border-b border-border">
          {(["releases", "events", "community"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-xs uppercase tracking-widest font-light transition-colors ${activeTab === tab ? "text-foreground border-b border-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab}
            </button>
          ))}
        </div>
        {activeTab === "releases" && <ReleasesSection />}
        {activeTab === "events" && <EventsSection />}
        {activeTab === "community" && <CommunitySection />}
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
      <Card className="p-6 rounded-none">
        <h2 className="text-2xl font-serif font-light mb-6">Add New Release</h2>
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
                    <FormLabel className="text-xs uppercase tracking-widest font-light">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="rounded-none"
                        placeholder="Cigar name"
                        {...field}
                      />
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
                    <FormLabel className="text-xs uppercase tracking-widest font-light">
                      Brand
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="rounded-none"
                        placeholder="Brand"
                        {...field}
                      />
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
                    <FormLabel className="text-xs uppercase tracking-widest font-light">
                      Release Date
                    </FormLabel>
                    <FormControl>
                      <Input className="rounded-none" type="date" {...field} />
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
                    <FormLabel className="text-xs uppercase tracking-widest font-light">
                      Region
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="rounded-none"
                        placeholder="e.g. UK & Europe"
                        {...field}
                      />
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
                    <FormLabel className="text-xs uppercase tracking-widest font-light">
                      Availability
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="rounded-none">
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
                  <FormLabel className="text-xs uppercase tracking-widest font-light">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="rounded-none"
                      placeholder="Optional"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-none text-xs uppercase tracking-widest font-light"
            >
              {createMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Add Release
            </Button>
          </form>
        </Form>
      </Card>

      <div>
        <h2 className="text-2xl font-serif font-light mb-4">
          Existing Releases
        </h2>
        {isLoading ? (
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-light">
            Loading...
          </p>
        ) : !releases?.length ? (
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-light">
            No releases yet
          </p>
        ) : (
          <div className="space-y-2">
            {releases.map((release) => (
              <div
                key={release.id}
                className="flex items-start justify-between gap-4 p-4 border border-border"
              >
                <div className="flex-1">
                  <p className="font-light text-sm">{release.name}</p>
                  <p className="text-xs text-muted-foreground font-light">
                    {release.brand} · {release.region} · {release.availability}
                  </p>
                  <p className="text-xs text-muted-foreground font-light">
                    {new Date(release.releaseDate).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="rounded-none w-8 h-8"
                  onClick={() => deleteMutation.mutate(release.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
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
      <Card className="p-6 rounded-none">
        <h2 className="text-2xl font-serif font-light mb-6">Add New Event</h2>
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
                    <FormLabel className="text-xs uppercase tracking-widest font-light">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="rounded-none"
                        placeholder="Event name"
                        {...field}
                      />
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
                    <FormLabel className="text-xs uppercase tracking-widest font-light">
                      Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="rounded-none"
                        type="datetime-local"
                        {...field}
                      />
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
                    <FormLabel className="text-xs uppercase tracking-widest font-light">
                      Location
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="rounded-none"
                        placeholder="Location"
                        {...field}
                      />
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
                    <FormLabel className="text-xs uppercase tracking-widest font-light">
                      Type
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="rounded-none">
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
                    <FormLabel className="text-xs uppercase tracking-widest font-light">
                      Max Capacity
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="rounded-none"
                        type="number"
                        placeholder="Optional"
                        {...field}
                      />
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
                    <FormLabel className="text-xs uppercase tracking-widest font-light">
                      Link
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="rounded-none"
                        placeholder="Optional URL"
                        {...field}
                      />
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
                  <FormLabel className="text-xs uppercase tracking-widest font-light">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="rounded-none"
                      placeholder="Optional"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-none text-xs uppercase tracking-widest font-light"
            >
              {createMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Add Event
            </Button>
          </form>
        </Form>
      </Card>

      <div>
        <h2 className="text-2xl font-serif font-light mb-4">Existing Events</h2>
        {isLoading ? (
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-light">
            Loading...
          </p>
        ) : !events?.length ? (
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-light">
            No events yet
          </p>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-start justify-between gap-4 p-4 border border-border"
              >
                <div className="flex-1">
                  <p className="font-light text-sm">{event.name}</p>
                  <p className="text-xs text-muted-foreground font-light">
                    {event.type} · {event.location}
                  </p>
                  <p className="text-xs text-muted-foreground font-light">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="rounded-none w-8 h-8"
                  onClick={() => deleteMutation.mutate(event.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CommunitySection() {
  const { toast } = useToast();

  const { data: posts = [], isLoading } = useQuery<CommunityPost[]>({
    queryKey: ["/api/community"],
  });

  const deletePostMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/community/${id}`),
    onSuccess: () => {
      toast({ title: "Post deleted!" });
      queryClient.invalidateQueries({ queryKey: ["/api/community"] });
    },
    onError: () =>
      toast({ title: "Failed to delete post", variant: "destructive" }),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/comments/${id}`),
    onSuccess: (_, id) => {
      toast({ title: "Comment deleted!" });
      queryClient.invalidateQueries({ queryKey: ["/api/community"] });
    },
    onError: () =>
      toast({ title: "Failed to delete comment", variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-serif font-light mb-4">Community Posts</h2>
      {isLoading ? (
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-light">
          Loading...
        </p>
      ) : !posts?.length ? (
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-light">
          No posts yet
        </p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="border border-border">
            <div className="flex items-start justify-between gap-4 p-4">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest font-light">
                  {post.userName}
                </p>
                {post.comment && (
                  <p className="text-sm font-light mt-1 text-muted-foreground">
                    {post.comment}
                  </p>
                )}
                <p className="text-xs text-muted-foreground font-light mt-1">
                  {new Date(post.timestamp).toLocaleDateString()} · {post.likes}{" "}
                  likes · {post.comments} comments
                </p>
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="rounded-none w-8 h-8 flex-shrink-0"
                onClick={() => deletePostMutation.mutate(post.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
            <PostComments
              postId={post.id}
              onDeleteComment={(id) => deleteCommentMutation.mutate(id)}
            />
          </div>
        ))
      )}
    </div>
  );
}

function PostComments({
  postId,
  onDeleteComment,
}: {
  postId: string;
  onDeleteComment: (id: string) => void;
}) {
  const { data: comments = [] } = useQuery<PostComment[]>({
    queryKey: [`/api/community/${postId}/comments`],
  });

  if (comments.length === 0) return null;

  return (
    <div className="border-t border-border px-4 py-3 space-y-2 bg-muted/10">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="flex items-start justify-between gap-3"
        >
          <div className="flex-1">
            <span className="text-xs uppercase tracking-widest font-light mr-2">
              {comment.userName}
            </span>
            <span className="text-xs font-light text-muted-foreground">
              {comment.text}
            </span>
          </div>
          <button
            onClick={() => onDeleteComment(comment.id)}
            className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

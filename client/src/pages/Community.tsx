import CommunityPost, {
  type CommunityPost as CommunityPostType,
} from "@/components/CommunityPost";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Send, X } from "lucide-react";
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { CommunityPost as CommunityPostSchema } from "@shared/schema";

function StoriesBar({ posts }: { posts: any[] }) {
  const recent = posts.filter((p) => {
    const age = Date.now() - new Date(p.timestamp).getTime();
    return age < 1000 * 60 * 60 * 24;
  });
  if (recent.length === 0) return null;

  return (
    <div className="mb-6">
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
        Currently Smoking 🔥
      </p>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {recent.slice(0, 10).map((post: any, i: number) => {
          const initials =
            post.userName
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase() || "AU";
          return (
            <div
              key={i}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
            >
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-primary to-amber-300">
                <Avatar className="w-14 h-14 border-2 border-background">
                  <AvatarImage src={post.userAvatar} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </div>
              <span className="text-xs text-muted-foreground max-w-[56px] truncate text-center">
                {post.userName?.split(" ")[0] || "Anon"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Community() {
  const [newPost, setNewPost] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth() as any;

  const { data: posts = [], isLoading } = useQuery<CommunityPostSchema[]>({
    queryKey: ["/api/community"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (post: any) => apiRequest("POST", "/api/community", post),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community"] });
      setNewPost("");
      setPhoto(null);
      setExpanded(false);
      toast({ title: "Posted!" });
    },
    onError: () => toast({ variant: "destructive", title: "Failed to post" }),
  });

  const likeMutation = useMutation({
    mutationFn: async (id: string) =>
      apiRequest("POST", `/api/community/${id}/like`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["/api/community"] }),
  });

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePost = () => {
    if (!newPost.trim() && !photo) return;
    createPostMutation.mutate({
      userName: user?.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : "Anonymous",
      cigarName: "Custom Cigar",
      rating: 0,
      comment: newPost,
      imageUrl: photo,
    });
  };

  const formattedPosts: CommunityPostType[] = (posts as any[]).map((post) => ({
    id: post.id,
    userName: post.userName,
    userAvatar: post.userAvatar || undefined,
    cigarName: post.cigarName,
    brand: post.brand || undefined,
    rating: post.rating,
    comment: post.comment || undefined,
    timestamp: new Date(post.timestamp),
    likes: post.likes,
    comments: post.comments,
    imageUrl: post.imageUrl || undefined,
  }));

  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName?.[0] || ""}`
    : "Y";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-semibold font-serif mb-1">Community</h1>
          <p className="text-muted-foreground text-sm">
            See what other aficionados are enjoying right now
          </p>
        </div>

        <StoriesBar posts={formattedPosts} />

        {/* Post Composer */}
        <Card className="p-4 mb-6">
          <div className="flex gap-3">
            <Avatar className="w-9 h-9 flex-shrink-0">
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                onFocus={() => setExpanded(true)}
                placeholder="What cigar are you enjoying? Share your thoughts..."
                className="resize-none border-0 p-0 shadow-none focus-visible:ring-0 bg-transparent min-h-[40px]"
                rows={expanded ? 3 : 1}
                data-testid="input-new-post"
              />

              {photo && (
                <div className="relative mt-3 w-32 h-32 rounded-lg overflow-hidden border border-border">
                  <img src={photo} className="w-full h-full object-cover" />
                  <button
                    onClick={() => setPhoto(null)}
                    className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {expanded && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    Photo
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhoto}
                  />
                  <Button
                    size="sm"
                    onClick={handlePost}
                    disabled={
                      (!newPost.trim() && !photo) ||
                      createPostMutation.isPending
                    }
                    className="gap-1.5"
                    data-testid="button-post"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Post
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Posts */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-64 animate-pulse bg-muted/30" />
            ))}
          </div>
        ) : formattedPosts.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <p className="text-4xl mb-3">🍂</p>
            <p className="font-serif text-lg mb-1">No posts yet</p>
            <p className="text-muted-foreground text-sm">
              Be the first to share what you're smoking!
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {formattedPosts.map((post) => (
              <CommunityPost
                key={post.id}
                post={post}
                onLike={(id) => likeMutation.mutate(id)}
                onComment={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

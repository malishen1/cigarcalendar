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
import { useLocation } from "wouter";
import type { CommunityPost as CommunityPostSchema } from "@shared/schema";

function StoriesBar({
  posts,
  onUserClick,
}: {
  posts: any[];
  onUserClick: (username: string) => void;
}) {
  const recent = posts.filter((p) => {
    const age = Date.now() - new Date(p.timestamp).getTime();
    return age < 1000 * 60 * 60 * 24;
  });
  if (recent.length === 0) return null;
  return (
    <div className="mb-8">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-light mb-4">
        Currently Smoking
      </p>
      <div className="flex gap-5 overflow-x-auto pb-2">
        {recent.slice(0, 10).map((post: any, i: number) => {
          const initials =
            post.userName
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase() || "AU";
          return (
            <button
              key={i}
              onClick={() => onUserClick(post.userName)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
            >
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-primary to-amber-300">
                <Avatar className="w-12 h-12 border-2 border-background">
                  <AvatarImage src={post.userAvatar} />
                  <AvatarFallback className="text-xs font-light">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className="text-xs text-muted-foreground font-light max-w-[48px] truncate text-center tracking-wide">
                {post.userName?.split(" ")[0] || "Anon"}
              </span>
            </button>
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
  const [, setLocation] = useLocation();

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
      userName: user?.username || "Anonymous",
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

  const initials = user?.username?.[0]?.toUpperCase() || "Y";

  const handleUserClick = (username: string) => {
    setLocation(`/profile/${encodeURIComponent(username)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-10 border-b border-border pb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-light mb-2">
              The Lounge
            </p>
            <h1 className="text-5xl font-serif font-light tracking-wide">
              Community
            </h1>
          </div>
        </div>

        <StoriesBar posts={formattedPosts} onUserClick={handleUserClick} />

        {/* Post Composer */}
        <div className="border border-border p-5 mb-8">
          <div className="flex gap-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback className="text-xs font-light">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                onFocus={() => setExpanded(true)}
                placeholder="What are you smoking?"
                className="resize-none border-0 p-0 shadow-none focus-visible:ring-0 bg-transparent min-h-[36px] text-sm font-light placeholder:text-muted-foreground"
                rows={expanded ? 3 : 1}
                data-testid="input-new-post"
              />
              {photo && (
                <div className="relative mt-3 w-28 h-28 overflow-hidden border border-border">
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
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest font-light"
                  >
                    <Camera className="w-3.5 h-3.5" />
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
                    className="gap-1.5 rounded-none text-xs uppercase tracking-widest font-light h-8 px-4"
                    data-testid="button-post"
                  >
                    <Send className="w-3 h-3" />
                    Post
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 animate-pulse bg-muted/20" />
            ))}
          </div>
        ) : formattedPosts.length === 0 ? (
          <div className="py-20 text-center border border-border">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-light mb-4">
              No posts yet
            </p>
            <p className="text-sm text-muted-foreground font-light">
              Be the first to share what you're smoking
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {formattedPosts.map((post) => (
              <CommunityPost
                key={post.id}
                post={post}
                onUserClick={handleUserClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

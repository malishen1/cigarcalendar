import CommunityPost, { type CommunityPost as CommunityPostType } from "@/components/CommunityPost";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CommunityPost as CommunityPostSchema } from "@shared/schema";

export default function Community() {
  const [newPost, setNewPost] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery<CommunityPostSchema[]>({
    queryKey: ['/api/community'],
  });

  const createPostMutation = useMutation({
    mutationFn: async (post: { userName: string; cigarName: string; rating: number; comment?: string }) => {
      return apiRequest('/api/community', {
        method: 'POST',
        body: JSON.stringify(post),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community'] });
      setNewPost('');
      toast({
        title: "Post created",
        description: "Your post has been shared with the community.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create post.",
      });
    }
  });

  const likeMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/community/${id}/like`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community'] });
    }
  });

  const commentMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/community/${id}/comment`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community'] });
    }
  });

  const formattedPosts: CommunityPostType[] = posts.map(post => ({
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
  }));

  const handlePost = () => {
    if (!newPost.trim()) return;
    
    createPostMutation.mutate({
      userName: "Anonymous User",
      cigarName: "Custom Cigar",
      rating: 4,
      comment: newPost,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-semibold font-serif mb-2">
            Community
          </h1>
          <p className="text-muted-foreground">
            See what other aficionados are enjoying right now
          </p>
        </div>

        <Card className="p-6 mb-6">
          <h3 className="font-medium mb-3">Share what you're smoking</h3>
          <Textarea
            placeholder="What cigar are you enjoying? Share your thoughts..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="min-h-24 resize-none mb-3"
            data-testid="input-new-post"
          />
          <Button
            className="gap-2"
            onClick={handlePost}
            disabled={!newPost.trim() || createPostMutation.isPending}
            data-testid="button-post"
          >
            <Plus className="w-4 h-4" />
            Post
          </Button>
        </Card>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-card rounded-lg animate-pulse" />
            ))}
          </div>
        ) : formattedPosts.length > 0 ? (
          <div className="space-y-4">
            {formattedPosts.map((post) => (
              <CommunityPost
                key={post.id}
                post={post}
                onLike={(id) => likeMutation.mutate(id)}
                onComment={(id) => commentMutation.mutate(id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
          </div>
        )}

        {formattedPosts.length > 0 && (
          <div className="text-center py-8">
            <Button variant="outline" data-testid="button-load-more">
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

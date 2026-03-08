import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface CommunityPost {
  id: string;
  userName: string;
  userAvatar?: string;
  cigarName: string;
  brand?: string;
  rating: number;
  comment?: string;
  timestamp: Date;
  likes: number;
  comments: number;
  imageUrl?: string;
}

interface PostComment {
  id: string;
  postId: string;
  userName: string;
  text: string;
  timestamp: string;
}

interface CommunityPostProps {
  post: CommunityPost;
  onUserClick?: (username: string) => void;
}

export default function CommunityPost({
  post,
  onUserClick,
}: CommunityPostProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: likeStatus } = useQuery({
    queryKey: [`/api/community/${post.id}/liked`],
    retry: false,
  });

  useEffect(() => {
    if (likeStatus && (likeStatus as any).liked !== undefined) {
      setIsLiked((likeStatus as any).liked);
    }
  }, [likeStatus]);

  const { data: comments = [], isLoading: commentsLoading } = useQuery<
    PostComment[]
  >({
    queryKey: [`/api/community/${post.id}/comments`],
    enabled: showComments,
  });

  const likeMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/community/${post.id}/like`, {}),
    onSuccess: (data: any) => {
      setIsLiked(data.liked);
      setLikeCount(data.likes);
    },
    onError: () =>
      toast({ variant: "destructive", title: "Must be logged in to like" }),
  });

  const commentMutation = useMutation({
    mutationFn: (text: string) =>
      apiRequest("POST", `/api/community/${post.id}/comments`, { text }),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({
        queryKey: [`/api/community/${post.id}/comments`],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/community"] });
    },
    onError: () =>
      toast({ variant: "destructive", title: "Must be logged in to comment" }),
  });

  const initials = post.userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleComment = () => {
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText);
  };

  return (
    <Card className="overflow-hidden rounded-none border-x-0 border-t-0 border-b border-border bg-transparent shadow-none">
      <div className="flex items-center gap-3 py-4">
        <div className="p-0.5 rounded-full bg-gradient-to-tr from-primary to-amber-300">
          <Avatar className="w-8 h-8 border-2 border-background">
            <AvatarImage src={post.userAvatar} />
            <AvatarFallback className="text-xs font-light">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1">
          <button
            onClick={() => onUserClick?.(post.userName)}
            className="text-xs uppercase tracking-widest font-light hover:text-primary transition-colors"
          >
            {post.userName}
          </button>
          <p className="text-xs text-muted-foreground font-light">
            {formatDistanceToNow(post.timestamp, { addSuffix: true })}
          </p>
        </div>
        {post.cigarName && post.cigarName !== "Custom Cigar" && (
          <span className="text-xs text-muted-foreground font-light tracking-wider uppercase">
            {post.cigarName}
          </span>
        )}
      </div>

      {post.imageUrl && (
        <div className="w-full aspect-square overflow-hidden bg-muted">
          <img
            src={post.imageUrl}
            alt="Post"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {post.comment && (
        <p className="py-2 text-sm font-light">
          <span className="text-xs uppercase tracking-widest mr-2">
            {post.userName.split(" ")[0]}
          </span>
          {post.comment}
        </p>
      )}

      {post.rating > 0 && (
        <div className="pb-2 flex gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`text-sm ${i <= post.rating ? "text-primary" : "text-muted-foreground/30"}`}
            >
              ★
            </span>
          ))}
        </div>
      )}

      <div className="py-3 flex items-center gap-5 border-t border-border">
        <button
          onClick={() => likeMutation.mutate()}
          disabled={likeMutation.isPending}
          className={`flex items-center gap-1.5 transition-colors ${isLiked ? "text-red-500" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500" : ""}`} />
          <span className="text-xs font-light">{likeCount}</span>
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs font-light">{post.comments}</span>
        </button>
      </div>

      {showComments && (
        <div className="pb-4 space-y-3">
          {commentsLoading ? (
            <p className="text-xs text-muted-foreground font-light tracking-widest uppercase">
              Loading...
            </p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-muted-foreground font-light tracking-widest uppercase">
              No comments yet
            </p>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <span className="text-xs uppercase tracking-widest font-light min-w-fit">
                    {c.userName}
                  </span>
                  <span className="text-xs font-light text-muted-foreground">
                    {c.text}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-2 border-t border-border">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-xs font-light border-none outline-none placeholder:text-muted-foreground tracking-wide"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleComment();
              }}
            />
            <button
              onClick={handleComment}
              disabled={!commentText.trim() || commentMutation.isPending}
              className="text-primary disabled:opacity-30 transition-opacity"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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

interface CommunityPostProps {
  post: CommunityPost;
  onLike?: (id: string) => void;
  onComment?: (id: string, text: string) => void;
}

export default function CommunityPost({
  post,
  onLike,
  onComment,
}: CommunityPostProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { toast } = useToast();

  const initials = post.userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    if (onLike) onLike(post.id);
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    if (onComment) onComment(post.id, commentText);
    toast({ title: "Comment posted!" });
    setCommentText("");
  };

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <div className="p-0.5 rounded-full bg-gradient-to-tr from-primary to-amber-300">
          <Avatar className="w-9 h-9 border-2 border-background">
            <AvatarImage src={post.userAvatar} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{post.userName}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(post.timestamp, { addSuffix: true })}
          </p>
        </div>
        {post.cigarName && post.cigarName !== "Custom Cigar" && (
          <span className="text-xs bg-muted px-3 py-1 rounded-full font-medium">
            🔥 {post.cigarName}
          </span>
        )}
      </div>

      {/* Photo */}
      {post.imageUrl && (
        <div className="w-full aspect-square overflow-hidden bg-muted">
          <img
            src={post.imageUrl}
            alt="Post"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pt-3 pb-1 flex items-center gap-4">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 transition-colors ${isLiked ? "text-red-500" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500" : ""}`} />
          <span className="text-sm">{likeCount}</span>
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">{post.comments}</span>
        </button>
      </div>

      {/* Caption */}
      {post.comment && (
        <p className="px-4 pb-3 text-sm">
          <span className="font-medium mr-1">
            {post.userName.split(" ")[0]}
          </span>
          {post.comment}
        </p>
      )}

      {/* Stars */}
      {post.rating > 0 && (
        <div className="px-4 pb-3 flex gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`text-sm ${i <= post.rating ? "text-primary" : "text-muted-foreground"}`}
            >
              ★
            </span>
          ))}
        </div>
      )}

      {/* Comments section */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-border pt-3 space-y-2">
          <div className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-sm border-b border-border outline-none pb-1 placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleComment();
              }}
            />
            <button
              onClick={handleComment}
              disabled={!commentText.trim()}
              className="text-primary disabled:opacity-30"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

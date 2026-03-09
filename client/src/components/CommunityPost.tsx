import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import StarRating from "./StarRating";
import { MessageCircle, ThumbsUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

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
}

interface CommunityPostProps {
  post: CommunityPost;
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
  onUserClick?: (userName: string) => void;
}

export default function CommunityPost({ post, onLike, onComment, onUserClick }: CommunityPostProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    if (onLike) {
      onLike(post.id);
    }
    console.log(`${isLiked ? 'Unliked' : 'Liked'} post: ${post.id}`);
  };

  const initials = post.userName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Card className="p-6">
      <div className="flex gap-4">
        <Avatar>
          <AvatarImage src={post.userAvatar} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="mb-2">
            <button
              onClick={() => onUserClick?.(post.userName)}
              className="font-medium hover:underline text-left"
              data-testid={`button-user-${post.userName}`}
            >
              {post.userName}
            </button>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(post.timestamp, { addSuffix: true })}
            </p>
          </div>

          <div className="mb-3">
            <p className="text-foreground mb-1">
              <span className="font-medium">Currently smoking:</span>{' '}
              <span className="font-serif">{post.cigarName}</span>
              {post.brand && <span className="text-muted-foreground"> by {post.brand}</span>}
            </p>
            <StarRating value={post.rating} readonly size="sm" />
          </div>

          {post.comment && (
            <p className="text-sm text-foreground mb-4">{post.comment}</p>
          )}

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${isLiked ? 'text-primary' : ''}`}
              onClick={handleLike}
              data-testid={`button-like-${post.id}`}
            >
              <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-primary' : ''}`} />
              {likeCount}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => {
                if (onComment) onComment(post.id);
                console.log(`Comment on post: ${post.id}`);
              }}
              data-testid={`button-comment-${post.id}`}
            >
              <MessageCircle className="w-4 h-4" />
              {post.comments}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

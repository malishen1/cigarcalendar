import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import StarRating from "./StarRating";
import { MessageCircle, ThumbsUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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
}

interface CommunityPostProps {
  post: CommunityPost;
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
}

export default function CommunityPost({ post, onLike, onComment }: CommunityPostProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [commentText, setCommentText] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    if (onLike) {
      onLike(post.id);
    }
    console.log(`${isLiked ? 'Unliked' : 'Liked'} post: ${post.id}`);
  };

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    
    // Call the comment handler to persist the comment
    if (onComment) {
      onComment(post.id);
    }
    
    // Show success feedback
    toast({
      title: "Comment posted",
      description: commentText,
    });
    
    // Reset form
    setCommentText("");
    setIsDialogOpen(false);
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
            <p className="font-medium">{post.userName}</p>
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  data-testid={`button-comment-${post.id}`}
                >
                  <MessageCircle className="w-4 h-4" />
                  {post.comments}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a Comment</DialogTitle>
                  <DialogDescription>
                    Share your thoughts about {post.userName}'s post
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  placeholder="Write your comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-24"
                  data-testid={`input-comment-${post.id}`}
                />
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCommentSubmit}
                    disabled={!commentText.trim()}
                    data-testid={`button-submit-comment-${post.id}`}
                  >
                    Post Comment
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </Card>
  );
}

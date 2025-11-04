import CommunityPost, { type CommunityPost as CommunityPostType } from "@/components/CommunityPost";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function Community() {
  const [newPost, setNewPost] = useState("");

  const [posts] = useState<CommunityPostType[]>([
    {
      id: '1',
      userName: 'James Mitchell',
      cigarName: 'Padron 1964 Anniversary',
      brand: 'Padron Cigars',
      rating: 5,
      comment: 'Absolutely incredible smoke. The complexity and smoothness are unmatched. Highly recommend!',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      likes: 12,
      comments: 3,
    },
    {
      id: '2',
      userName: 'Sarah Thompson',
      cigarName: 'Montecristo No. 2',
      brand: 'Habanos S.A.',
      rating: 5,
      comment: 'Classic Cuban excellence. Perfect draw and rich flavors throughout. A staple in my rotation.',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      likes: 8,
      comments: 2,
    },
    {
      id: '3',
      userName: 'David Chen',
      cigarName: 'Arturo Fuente Opus X',
      brand: 'Arturo Fuente',
      rating: 5,
      comment: 'Finally got my hands on one! Worth the wait. Exceptional construction and flavor profile.',
      timestamp: new Date(Date.now() - 1000 * 60 * 180),
      likes: 15,
      comments: 5,
    },
    {
      id: '4',
      userName: 'Michael Roberts',
      cigarName: 'Oliva Serie V Melanio',
      brand: 'Oliva Cigar Co.',
      rating: 4,
      comment: 'Great value for the price. Bold and flavorful with good construction.',
      timestamp: new Date(Date.now() - 1000 * 60 * 240),
      likes: 6,
      comments: 1,
    },
  ]);

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
            onClick={() => {
              console.log('New post:', newPost);
              setNewPost('');
            }}
            data-testid="button-post"
          >
            <Plus className="w-4 h-4" />
            Post
          </Button>
        </Card>

        <div className="space-y-4">
          {posts.map((post) => (
            <CommunityPost
              key={post.id}
              post={post}
              onLike={(id) => console.log('Like', id)}
              onComment={(id) => console.log('Comment', id)}
            />
          ))}
        </div>

        <div className="text-center py-8">
          <Button variant="outline" data-testid="button-load-more">
            Load More
          </Button>
        </div>
      </div>
    </div>
  );
}

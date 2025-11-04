import CommunityPost from '../CommunityPost';

export default function CommunityPostExample() {
  const post = {
    id: '1',
    userName: 'James Mitchell',
    cigarName: 'Padron 1964 Anniversary',
    brand: 'Padron Cigars',
    rating: 5,
    comment: 'Absolutely incredible smoke. The complexity and smoothness are unmatched. Highly recommend!',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    likes: 12,
    comments: 3,
  };

  return (
    <CommunityPost 
      post={post}
      onLike={(id) => console.log('Like', id)}
      onComment={(id) => console.log('Comment', id)}
    />
  );
}

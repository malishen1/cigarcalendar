import StarRating from '../StarRating';
import { useState } from 'react';

export default function StarRatingExample() {
  const [rating, setRating] = useState(4);
  return <StarRating value={rating} onChange={setRating} />;
}

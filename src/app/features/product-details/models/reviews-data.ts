import {Review} from './review';

export interface ReviewsData {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { stars: number; count: number }[];
  reviewsList?: Review[]; // Assuming the full list might come here
  // Add any other properties
}

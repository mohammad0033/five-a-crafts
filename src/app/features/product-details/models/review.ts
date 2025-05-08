export interface Review {
  id: number;
  rating: number;
  date: string; // Or Date
  userName?: string;
  comment: string;
  // Add any other properties your review object has
}

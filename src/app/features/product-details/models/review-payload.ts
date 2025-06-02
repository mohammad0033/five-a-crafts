export interface ReviewPayload {
  product: number;
  title: string;
  score: number;
  body: string;
  // Add any other fields your backend API expects for creating a review.
  // The product ID is typically part of the URL.
  // The user ID is often inferred from the authentication token on the backend.
}

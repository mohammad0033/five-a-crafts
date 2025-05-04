export interface PageMetadata {
  title: string;
  description: string;
  ogImageUrl?: string; // Optional: API might provide specific images
  twitterImageUrl?: string; // Optional
  // Add other potential fields like canonicalUrl if the API provides them
}

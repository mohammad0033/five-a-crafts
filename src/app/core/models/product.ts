export interface Product {
  id: string | number;
  name: string;
  description?: string;
  imageUrl: string;
  price: number;
  isFavorite?: boolean;
  altText?: string; // Optional alt text for images
}

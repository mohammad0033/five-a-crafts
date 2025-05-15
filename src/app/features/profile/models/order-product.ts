export interface OrderProduct {
  id: string; // Or some unique identifier for the product
  name: string;
  description: string;
  imageUrl: string; // Or image path
  altText?: string; // Optional alt text for the image
  price: number; // Use number for calculations
  quantity: number;
  slug: string; // To potentially link back to the product page
}

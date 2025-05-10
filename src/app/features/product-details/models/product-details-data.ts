import {ProductImageData} from './product-image-data';
import {ProductCategoryInfo} from './product-category-info';
import {PageMetadata} from '../../../core/models/page-meta-data';

export interface ProductDetailsData {
  id: string | number;
  slug: string;
  name: string;
  description: string; // Main product description for the page body
  price: number;
  sku?: string;
  inStock?: boolean;
  stockQuantity?: number;
  isFavorite?: boolean;
  images: ProductImageData[];
  category: ProductCategoryInfo; // Include category info for breadcrumbs etc.
  metadata: PageMetadata; // Nest the metadata within the main data object
  variations?: any[];
  // Add any other relevant product fields: attributes, reviews, etc.
}

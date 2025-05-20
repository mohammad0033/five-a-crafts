import {ProductImageData} from './product-image-data';
import {ProductCategoryInfo} from './product-category-info';
import {PageMetadata} from '../../../core/models/page-meta-data';
import {Price} from '../../../core/models/price';

export interface ProductDetailsData {
  id: string | number;
  slug: string;
  title: string;
  product_class?: string;
  description: string; // Main product description for the page body
  recommended_products: any[];
  product_options: any[];
  price: Price;
  calculate_rating: any;
  num_approved_reviews: number;
  stock?: number;
  in_wishlist?: boolean;
  images: ProductImageData[];
  rating: number | null;
  metaData: PageMetadata;
}

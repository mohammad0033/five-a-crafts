import {ProductImageData} from '../../features/product-details/models/product-image-data';
import {Price} from './price';

export interface Product {
  url?: string;
  id: string | number;
  title: string;
  description: string;
  images?: ProductImageData[];
  product_class?: string;
  price?: Price;
  stock?: number;
  slug?: string;
  calculate_rating?: any;
  num_approved_reviews?: number;
  rating?: number;
  has_options?: boolean;
  in_wishlist: boolean;
}

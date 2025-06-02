import {Product} from '../../../core/models/product';

export interface WishlistProduct {
  id: number;
  product: number;
  product_detail: Product;
  quantity: number;
  title: string;
}

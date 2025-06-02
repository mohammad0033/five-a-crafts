import {WishlistProduct} from './wishlist-product';

export interface Wishlist {
  id: number;
  name: string;
  lines: WishlistProduct[];
}

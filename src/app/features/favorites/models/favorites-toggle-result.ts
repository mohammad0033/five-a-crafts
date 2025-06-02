import {WishlistProduct} from './wishlist-product';
import {Product} from '../../../core/models/product';

export interface FavoritesToggleResult {
  action: 'added' | 'removed';
  product?: Product; // The actual product details if added
  productId: number | string;
  wishlistProduct?: WishlistProduct; // The WishlistProduct if available
}

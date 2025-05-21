import {Product} from '../../../core/models/product';
import {SelectedVariation} from './selected-variation';

export interface CartItem {
  id: string; // A unique ID for this cart item instance (product.id + serialized_variations)
  product: Product;       // The core product details (id, name, price, imageUrl)
  quantity: number;       // The quantity selected by the user (from productDetailsComponent.productQty)
  originalStock?: number; // The stock quantity of the product (from productDetailsData.stockQuantity)
  // This is useful for the quantity controls within the cart item itself.
  selectedVariations?: SelectedVariation; // To store chosen options like color
}

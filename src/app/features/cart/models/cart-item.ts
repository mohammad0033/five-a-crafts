import {Product} from '../../../core/models/product';

export interface CartItem {
  product: Product;       // The core product details (id, name, price, imageUrl)
  quantity: number;       // The quantity selected by the user (from productDetailsComponent.productQty)
  originalStock?: number; // The stock quantity of the product (from productDetailsData.stockQuantity)
  // This is useful for the quantity controls within the cart item itself.
  // variations?: any;    // Any selected product variations
}

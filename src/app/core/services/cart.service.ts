import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import { map } from 'rxjs/operators';
import { CartItem } from '../../features/cart/models/cart-item';
import { Product } from '../models/product';
import {isPlatformBrowser} from '@angular/common'; // Ensure this path is correct

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private drawerOpen = new BehaviorSubject<boolean>(false);
  drawerOpen$ = this.drawerOpen.asObservable();

  private cartItems = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItems.asObservable();

  // Mock discount and shipping fee
  private discountAmountSource = new BehaviorSubject<number>(0); // Initial mock discount
  discount$: Observable<number> = this.discountAmountSource.asObservable();

  private shippingFeeSource = new BehaviorSubject<number>(0);    // Initial mock shipping fee
  shippingFee$: Observable<number> = this.shippingFeeSource.asObservable();

  // Subtotal: sum of (item.product.price * item.quantity)
  subtotal$: Observable<number> = this.cartItems$.pipe(
    map(items => Number((items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0)).toFixed(2)))
  );

  // Total Amount: subtotal + shipping - discount
  totalAmount$: Observable<number> = combineLatest([
    this.subtotal$,
    this.shippingFee$,
    this.discount$
  ]).pipe(
    map(([subtotal, shipping, discount]) => {
      const total = subtotal + shipping - discount;
      return Number(Math.max(0, total).toFixed(2)); // Ensure total is not negative and fix to 2 decimal places
    })
  );

  // Observable for the total number of items (sum of quantities)
  itemCount$: Observable<number> = this.cartItems$.pipe(
    map(items => items.reduce((acc, item) => acc + item.quantity, 0))
  );

  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId); // Check if running in browser

    if (this.isBrowser) {
      // Load cart from localStorage only if in the browser
      this.loadCartFromLocalStorage();
      // Initialize mock values (or load them from somewhere if they are dynamic)
      // These can be updated later via methods if needed (e.g., applyPromoCode)
      this.discountAmountSource.next(30); // Example: 30 LE discount
      this.shippingFeeSource.next(50);   // Example: 50 LE shipping fee
    }
  }

  toggleDrawer(isOpen?: boolean): void {
    this.drawerOpen.next(isOpen === undefined ? !this.drawerOpen.value : isOpen);
  }

  openDrawer(): void {
    this.drawerOpen.next(true);
  }

  closeDrawer(): void {
    this.drawerOpen.next(false);
  }

  /**
   * Adds a product to the cart or updates its quantity if it already exists.
   * @param product The product to add.
   * @param quantity The quantity to add.
   * @param originalStock The available stock for the product.
   * @param variations Optional: Any selected product variations.
   */
  addItem(product: Product, quantity: number, originalStock?: number, variations?: any): void {
    const currentItems = this.cartItems.value;
    // A more robust check for existing items might include variations
    const existingItemIndex = currentItems.findIndex(item =>
      item.product.id === product.id /* && deepCompare(item.variations, variations) */
    );

    if (existingItemIndex > -1) {
      const updatedItems = [...currentItems];
      const existingItem = updatedItems[existingItemIndex];
      let newQuantity = existingItem.quantity + quantity;

      // Ensure quantity does not exceed stock if stock info is available
      if (existingItem.originalStock !== undefined) {
        newQuantity = Math.min(newQuantity, existingItem.originalStock);
      }
      updatedItems[existingItemIndex].quantity = newQuantity;
      this.cartItems.next(updatedItems);
    } else {
      const newItem: CartItem = {
        product,
        quantity,
        originalStock,
        // variations // Uncomment if you handle variations
      };
      this.cartItems.next([...currentItems, newItem]);
    }
    this.saveCartToLocalStorage();
    // Optionally open the drawer when an item is added
    // this.openDrawer();
  }

  /**
   * Updates the quantity of a specific item in the cart.
   * @param productId The ID of the product to update.
   * @param newQuantity The new quantity.
   */
  updateItemQuantity(productId: string | number, newQuantity: number): void {
    const currentItems = this.cartItems.value;
    const itemIndex = currentItems.findIndex(item => item.product.id === productId);

    if (itemIndex > -1) {
      const updatedItems = [...currentItems];
      const itemToUpdate = updatedItems[itemIndex];

      if (newQuantity > 0) {
        // Ensure new quantity does not exceed original stock if available
        const stockLimit = itemToUpdate.originalStock;
        itemToUpdate.quantity = stockLimit !== undefined ? Math.min(newQuantity, stockLimit) : newQuantity;
      } else {
        // If quantity becomes 0 or less, remove the item
        updatedItems.splice(itemIndex, 1);
      }
      this.cartItems.next(updatedItems);
      this.saveCartToLocalStorage();
    }
  }

  /**
   * Removes an item completely from the cart.
   * @param productId The ID of the product to remove.
   */
  removeItem(productId: string | number): void {
    const updatedItems = this.cartItems.value.filter(item => item.product.id !== productId);
    this.cartItems.next(updatedItems);
    this.saveCartToLocalStorage();
  }

  /**
   * Clears all items from the cart.
   */
  clearCart(): void {
    this.cartItems.next([]);
    this.saveCartToLocalStorage();
  }

  // --- LocalStorage Persistence ---
  private saveCartToLocalStorage(): void {
    if (this.isBrowser) { // Only save if in browser
      try {
        localStorage.setItem('fiveACraftsShoppingCart', JSON.stringify(this.cartItems.value));
      } catch (e) {
        console.error('Error saving cart to localStorage:', e);
      }
    }
  }

  private loadCartFromLocalStorage(): void {
    // This method is already guarded by the constructor's isBrowser check,
    // but an additional check here doesn't hurt and makes it more robust
    // if called from elsewhere.
    if (this.isBrowser) {
      try {
        const storedCart = localStorage.getItem('fiveACraftsShoppingCart');
        if (storedCart) {
          const parsedCart: CartItem[] = JSON.parse(storedCart);
          // Enhanced validation for item structure
          if (Array.isArray(parsedCart) && parsedCart.every(item =>
            item &&
            typeof item.product === 'object' && item.product !== null &&
            typeof item.product.id !== 'undefined' && // Basic check for product object
            true
          )) {
            this.cartItems.next(parsedCart);
          } else {
            console.warn('Invalid cart data found in localStorage. Clearing it.');
            localStorage.removeItem('fiveACraftsShoppingCart');
          }
        }
      } catch (e) {
        console.error('Error loading cart from localStorage:', e);
        localStorage.removeItem('fiveACraftsShoppingCart');
      }
    }
  }

  // Optional: Methods to update mock discount and shipping if needed from elsewhere
  public setDiscount(amount: number): void {
    this.discountAmountSource.next(Math.max(0, amount)); // Ensure discount isn't negative
  }

  public setShippingFee(amount: number): void {
    this.shippingFeeSource.next(Math.max(0, amount)); // Ensure shipping isn't negative
  }
}

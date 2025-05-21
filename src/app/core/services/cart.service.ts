import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, startWith} from 'rxjs';
import { map } from 'rxjs/operators';
import { CartItem } from '../../features/cart/models/cart-item';
import { Product } from '../models/product';
import {isPlatformBrowser} from '@angular/common';
import {SelectedVariation} from '../../features/cart/models/selected-variation';

const CART_STORAGE_KEY = 'fiveACraftsShoppingCart';
const BASE_DISCOUNT_STORAGE_KEY = 'fiveACraftsBaseDiscount';
const PROMO_DISCOUNT_STORAGE_KEY = 'fiveACraftsPromoDiscount';
const SHIPPING_FEE_STORAGE_KEY = 'fiveACraftsShippingFee';

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

interface StoredItem<T> {
  value: T;
  expiresAt: number; // Timestamp in milliseconds
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private drawerOpen = new BehaviorSubject<boolean>(false);
  drawerOpen$ = this.drawerOpen.asObservable();

  private cartItemsSource = new BehaviorSubject<CartItem[]>([]);
  cartItems$: Observable<CartItem[]> = this.cartItemsSource.asObservable();

  private baseDiscountAmountSource = new BehaviorSubject<number>(0);
  baseDiscount$: Observable<number> = this.baseDiscountAmountSource.asObservable();

  private promoDiscountAmountSource = new BehaviorSubject<number>(0);
  promoDiscount$: Observable<number> = this.promoDiscountAmountSource.asObservable();

  discount$: Observable<number>;

  private shippingFeeSource = new BehaviorSubject<number>(0);
  shippingFee$: Observable<number> = this.shippingFeeSource.asObservable();

  subtotal$: Observable<number>;
  totalAmount$: Observable<number>;
  itemCount$: Observable<number>;

  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.subtotal$ = this.cartItemsSource.pipe(
      map(items => Number((items.reduce((acc, item) => acc + (item.product.price?.incl_tax! * item.quantity), 0)).toFixed(2))),
      startWith(0)
    );

    this.discount$ = combineLatest([
      this.baseDiscountAmountSource,
      this.promoDiscountAmountSource
    ]).pipe(
      map(([baseDiscount, promoDiscount]) => Number((baseDiscount + promoDiscount).toFixed(2))),
      startWith(0)
    );

    this.totalAmount$ = combineLatest([
      this.subtotal$,
      this.shippingFeeSource,
      this.discount$
    ]).pipe(
      map(([subtotal, shipping, totalDiscountValue]) => {
        const total = subtotal + shipping - totalDiscountValue;
        return Number(Math.max(0, total).toFixed(2));
      }),
      startWith(0)
    );

    this.itemCount$ = this.cartItemsSource.pipe(
      map(items => items.reduce((acc, item) => acc + item.quantity, 0)),
      startWith(0)
    );

    if (this.isBrowser) {
      this.loadCartStateFromLocalStorage();
    }
  }

  // --- Helper to generate a unique ID for a cart item based on product and variations ---
  private generateCartItemId(productId: number, variations?: SelectedVariation): string {
    const baseId = String(productId);
    if (!variations || Object.keys(variations).length === 0) {
      return baseId;
    }
    // Sort keys of variations for a consistent ID, regardless of object key order.
    // Normalize keys and values for robustness (e.g., lowercase, replace spaces).
    const sortedVariationKeys = Object.keys(variations).sort();
    const variationString = sortedVariationKeys
      .map(key => `${key.toLowerCase().replace(/\s+/g, '-')}_${String(variations[key]).toLowerCase().replace(/\s+/g, '-')}`)
      .join(';'); // Use a separator that's unlikely in keys/values
    return `${baseId}-${variationString}`;
  }

  // --- LocalStorage Helper Methods with Expiration ---
  private saveDataWithExpiration<T>(key: string, data: T): void {
    if (this.isBrowser) {
      const now = new Date().getTime();
      const itemToStore: StoredItem<T> = {
        value: data,
        expiresAt: now + SEVEN_DAYS_IN_MS
      };
      try {
        localStorage.setItem(key, JSON.stringify(itemToStore));
      } catch (e) {
        console.error(`Error saving ${key} to localStorage:`, e);
      }
    }
  }

  private loadDataWithExpiration<T>(key: string): T | null {
    if (this.isBrowser) {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) {
        return null;
      }
      try {
        const item: StoredItem<T> = JSON.parse(itemStr);
        const now = new Date().getTime();
        if (now > item.expiresAt) {
          localStorage.removeItem(key); // Expired
          console.log(`CartService: Item with key ${key} has expired and was removed.`);
          return null;
        }
        return item.value;
      } catch (e) {
        console.error(`CartService: Error parsing or checking expiration for ${key} from localStorage:`, e);
        localStorage.removeItem(key); // Corrupted data
        return null;
      }
    }
    return null;
  }

  // --- Update existing LocalStorage Persistence methods ---
  private saveCartItemsToLocalStorage(): void {
    this.saveDataWithExpiration(CART_STORAGE_KEY, this.cartItemsSource.value);
  }

  private saveBaseDiscountToLocalStorage(): void {
    this.saveDataWithExpiration(BASE_DISCOUNT_STORAGE_KEY, this.baseDiscountAmountSource.value);
  }

  private savePromoDiscountToLocalStorage(): void {
    this.saveDataWithExpiration(PROMO_DISCOUNT_STORAGE_KEY, this.promoDiscountAmountSource.value);
  }

  private saveShippingFeeToLocalStorage(): void {
    this.saveDataWithExpiration(SHIPPING_FEE_STORAGE_KEY, this.shippingFeeSource.value);
  }

  private loadCartStateFromLocalStorage(): void {
    if (!this.isBrowser) return;

    let loadedCartItems = this.loadDataWithExpiration<CartItem[]>(CART_STORAGE_KEY);

    // Updated validation to check for the new `id` field and other core properties
    if (loadedCartItems === null || !Array.isArray(loadedCartItems) || !loadedCartItems.every(item =>
        item &&
        typeof item.id === 'string' && // CRUCIAL: Check for the new cart item ID
        item.product && typeof item.product === 'object' && typeof item.product.id === 'number' &&
        typeof item.quantity === 'number'
      // item.selectedVariations is optional, so no strict check unless always expected
    )) {
      if (loadedCartItems !== null && Array.isArray(loadedCartItems)) {
        console.warn('CartService: Loaded cart items were invalid or malformed. Attempting migration...');
        // Attempt to migrate old items by generating IDs
        const migratedItems: CartItem[] = [];
        loadedCartItems.forEach(item => {
          if (item && item.product && typeof item.product.id === 'number') {
            // @ts-ignore - Old items might not have 'id' or 'selectedVariations' typed correctly
            if (!item.id) {
              // @ts-ignore
              item.id = this.generateCartItemId(item.product.id, item.selectedVariations);
              console.log(`CartService: Migrated cart item, generated ID: ${item.id} for product ${item.product.id}`);
            }
            // Ensure all required fields are present after potential migration
            if (typeof item.id === 'string' && item.product && typeof item.quantity === 'number') {
              migratedItems.push(item as CartItem);
            } else {
              console.warn('CartService: Could not fully migrate item, discarding:', item);
            }
          } else {
            console.warn('CartService: Discarding invalid item during migration:', item);
          }
        });
        loadedCartItems = migratedItems;
      } else {
        if (loadedCartItems !== null) console.warn('CartService: Loaded cart items were invalid or expired, resetting.');
        loadedCartItems = []; // Default if expired, not found, or truly invalid
      }
    }

    this.cartItemsSource.next(loadedCartItems);
    // Always re-save to ensure new structure (with IDs) and refresh expiration
    this.saveCartItemsToLocalStorage();

    // ... (loading for discounts and shipping fee remains the same)
    let loadedBaseDiscount = this.loadDataWithExpiration<number>(BASE_DISCOUNT_STORAGE_KEY);
    if (loadedBaseDiscount === null || typeof loadedBaseDiscount !== 'number') {
      if (loadedBaseDiscount !== null) console.warn('CartService: Loaded base discount was invalid or expired, resetting.');
      loadedBaseDiscount = 30; // Default
    }
    this.baseDiscountAmountSource.next(loadedBaseDiscount);
    this.saveBaseDiscountToLocalStorage();

    let loadedPromoDiscount = this.loadDataWithExpiration<number>(PROMO_DISCOUNT_STORAGE_KEY);
    if (loadedPromoDiscount === null || typeof loadedPromoDiscount !== 'number') {
      if (loadedPromoDiscount !== null) console.warn('CartService: Loaded promo discount was invalid or expired, resetting.');
      loadedPromoDiscount = 0; // Default
    }
    this.promoDiscountAmountSource.next(loadedPromoDiscount);
    this.savePromoDiscountToLocalStorage();

    let loadedShippingFee = this.loadDataWithExpiration<number>(SHIPPING_FEE_STORAGE_KEY);
    if (loadedShippingFee === null || typeof loadedShippingFee !== 'number') {
      if (loadedShippingFee !== null) console.warn('CartService: Loaded shipping fee was invalid or expired, resetting.');
      loadedShippingFee = 50; // Default
    }
    this.shippingFeeSource.next(loadedShippingFee);
    this.saveShippingFeeToLocalStorage();
  }


  // --- Public API methods (addItem, updateItemQuantity, etc.) remain the same ---
  // They already call the save...ToLocalStorage methods, which now handle expiration.

  toggleDrawer(isOpen?: boolean): void {
    this.drawerOpen.next(isOpen === undefined ? !this.drawerOpen.value : isOpen);
  }

  openDrawer(): void {
    this.drawerOpen.next(true);
  }

  closeDrawer(): void {
    this.drawerOpen.next(false);
  }

  addItem(product: Product, quantity: number, originalStock?: number, variations?: SelectedVariation): void {
    const currentItems = this.cartItemsSource.value;
    const cartItemId = this.generateCartItemId(product.id, variations);

    const existingItemIndex = currentItems.findIndex(item => item.id === cartItemId);

    if (existingItemIndex > -1) {
      const updatedItems = [...currentItems];
      const existingItem = updatedItems[existingItemIndex];
      let newQuantity = existingItem.quantity + quantity;
      if (existingItem.originalStock !== undefined) {
        newQuantity = Math.min(newQuantity, existingItem.originalStock);
      }
      updatedItems[existingItemIndex].quantity = newQuantity;
      this.cartItemsSource.next(updatedItems);
      console.log(`CartService: Updated quantity for item ${cartItemId} to ${newQuantity}`);
    } else {
      const newItem: CartItem = {
        id: cartItemId,
        product,
        quantity,
        originalStock,
        selectedVariations: variations && Object.keys(variations).length > 0 ? variations : undefined
      };
      this.cartItemsSource.next([...currentItems, newItem]);
      console.log(`CartService: Added new item ${cartItemId} with quantity ${quantity}`, newItem);
    }
    this.saveCartItemsToLocalStorage();
  }

  updateItemQuantity(cartItemId: string, newQuantity: number): void {
    const currentItems = this.cartItemsSource.value;
    const itemIndex = currentItems.findIndex(item => item.id === cartItemId);

    if (itemIndex > -1) {
      const updatedItems = [...currentItems];
      const itemToUpdate = updatedItems[itemIndex];
      if (newQuantity > 0) {
        const stockLimit = itemToUpdate.originalStock;
        itemToUpdate.quantity = stockLimit !== undefined ? Math.min(newQuantity, stockLimit) : newQuantity;
      } else {
        updatedItems.splice(itemIndex, 1); // Remove if new quantity is 0 or less
      }
      this.cartItemsSource.next(updatedItems);
      this.saveCartItemsToLocalStorage();
      console.log(`CartService: Item ${cartItemId} quantity updated to ${itemToUpdate.quantity}. Items in cart:`, updatedItems.length);
    } else {
      console.warn(`CartService: Item with cart ID ${cartItemId} not found for quantity update.`);
    }
  }

  removeItem(cartItemId: string): void {
    const currentItems = this.cartItemsSource.value;
    const updatedItems = currentItems.filter(item => item.id !== cartItemId);

    if (updatedItems.length < currentItems.length) {
      console.log(`CartService: Item with cart ID ${cartItemId} found and removed.`);
    } else {
      console.warn(`CartService: Item with cart ID ${cartItemId} NOT found for removal. Cart items checked:`, currentItems.map(i => i.id));
    }

    this.cartItemsSource.next(updatedItems);
    console.log(`CartService: Updated cart items after attempting removal of ID ${cartItemId}:`, this.cartItemsSource.value);
    this.saveCartItemsToLocalStorage();
  }

  clearCart(): void {
    this.cartItemsSource.next([]);
    this.promoDiscountAmountSource.next(0);
    // this.baseDiscountAmountSource.next(0); // Or some default if base discount should reset
    this.saveCartItemsToLocalStorage(); // Saves empty cart with new expiration
    this.savePromoDiscountToLocalStorage(); // Saves 0 promo discount with new expiration
    // if base discount is reset, save it too: this.saveBaseDiscountToLocalStorage();
  }

  public applyPromoCodeDiscount(amount: number): void {
    const currentPromoDiscount = this.promoDiscountAmountSource.value;
    this.promoDiscountAmountSource.next(currentPromoDiscount + amount);
    this.savePromoDiscountToLocalStorage();
    console.log(`CartService: Applied promo discount of ${amount}. New total promo discount: ${this.promoDiscountAmountSource.value}`);
  }

  public clearPromoCodeDiscount(): void {
    this.promoDiscountAmountSource.next(0);
    this.savePromoDiscountToLocalStorage();
    console.log('CartService: Promo discount cleared.');
  }

  public setBaseDiscount(amount: number){
    this.baseDiscountAmountSource.next(Math.max(0, amount));
    this.saveBaseDiscountToLocalStorage();
  }

  public setShippingFee(amount: number){
    this.shippingFeeSource.next(Math.max(0, amount));
    this.saveShippingFeeToLocalStorage();
  }
}

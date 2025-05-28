import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product';

const MAX_RECENTLY_VIEWED = 5; // Define how many products to keep in the list
const RECENTLY_VIEWED_KEY = 'recentlyViewedProducts';
const EXPIRATION_DAYS = 7; // Expiration time in days
const EXPIRATION_TIME_MS = EXPIRATION_DAYS * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Interface for the items stored in localStorage
interface RecentlyViewedStorageItem {
  product: Product;
  addedAt: number; // Timestamp (milliseconds since epoch) when the product was added
}

@Injectable({
  providedIn: 'root'
})
export class RecentlyViewedService {
  // This subject and observable will emit only the Product array for consumers
  private recentlyViewedProductsSubject: BehaviorSubject<Product[]> = new BehaviorSubject<Product[]>([]);
  public recentlyViewedProducts$: Observable<Product[]> = this.recentlyViewedProductsSubject.asObservable();

  // Internally, we'll manage the list with timestamps
  private recentlyViewedItems: RecentlyViewedStorageItem[] = [];
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.loadFromLocalStorage();
    }
  }

  private loadFromLocalStorage(): void {
    const storedItemsJson = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (storedItemsJson) {
      try {
        const storedItems = JSON.parse(storedItemsJson) as RecentlyViewedStorageItem[];
        const now = Date.now();

        // Filter out expired items and also ensure items are valid (have product and addedAt)
        let validAndNonExpiredItems = storedItems.filter(item =>
          item && item.product && true && (now - item.addedAt < EXPIRATION_TIME_MS)
        );

        // Sort by addedAt descending to ensure the most recent (non-expired) are kept if slicing
        validAndNonExpiredItems.sort((a, b) => b.addedAt - a.addedAt);

        // Enforce MAX_RECENTLY_VIEWED limit after filtering and sorting
        this.recentlyViewedItems = validAndNonExpiredItems.slice(0, MAX_RECENTLY_VIEWED);

        this.updateSubjectsAndStorage(); // This will also save the potentially sliced and cleaned list
      } catch (e) {
        console.error('Error parsing or processing recently viewed products from localStorage', e);
        localStorage.removeItem(RECENTLY_VIEWED_KEY); // Clear corrupted data
        this.recentlyViewedItems = [];
        this.updateSubjectsAndStorage(); // Reset to empty state
      }
    }
  }

  private saveToLocalStorage(): void {
    if (this.isBrowser) {
      // Save the internal list which includes timestamps
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(this.recentlyViewedItems));
    }
  }

  // Helper to update the BehaviorSubject (emitting Product[]) and save to localStorage
  private updateSubjectsAndStorage(): void {
    const productsToEmit = this.recentlyViewedItems.map(item => item.product);
    this.recentlyViewedProductsSubject.next(productsToEmit);
    this.saveToLocalStorage();
  }

  addProduct(productToAdd: Product): void {
    if (!this.isBrowser || !productToAdd) {
      return;
    }

    // Ensure productToAdd has an ID for accurate duplicate checking and management
    if (!productToAdd.id) {
      console.warn('Product added to recently viewed is missing an ID. It will not be added.', productToAdd);
      return; // Skip if no ID
    }

    const now = Date.now();

    // 1. Filter out any items from the current in-memory list that might have expired
    this.recentlyViewedItems = this.recentlyViewedItems.filter(item => (now - item.addedAt < EXPIRATION_TIME_MS));

    // 2. Remove the product if it already exists (by ID) to move it to the front with an updated timestamp
    this.recentlyViewedItems = this.recentlyViewedItems.filter(item => item.product.id !== productToAdd.id);

    // 3. Add the new product (or re-added product) to the beginning of the list with the current timestamp
    this.recentlyViewedItems.unshift({ product: productToAdd, addedAt: now });

    // 4. Ensure the list does not exceed the maximum size
    this.recentlyViewedItems = this.recentlyViewedItems.slice(0, MAX_RECENTLY_VIEWED);

    // 5. Update the BehaviorSubject and save to localStorage
    this.updateSubjectsAndStorage();
  }

  getRecentlyViewedProducts(): Observable<Product[]> {
    // The public observable already emits Product[] as expected by consumers
    return this.recentlyViewedProducts$;
  }

  clearRecentlyViewed(): void {
    if (!this.isBrowser) {
      return;
    }
    this.recentlyViewedItems = [];
    this.updateSubjectsAndStorage(); // This will clear the BehaviorSubject and localStorage
  }
}

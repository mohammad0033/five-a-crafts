// C:/Ongoing projects/five-a-crafts/src/app/core/services/favorites-api.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs'; // 'of' might be needed if not already imported
import { catchError, tap, finalize, map, delay } from 'rxjs/operators'; // 'delay' might be needed
import { Product } from '../models/product';
import { ProductsApiService } from './products-api.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritesApiService {
  private favoritesSubject = new BehaviorSubject<Product[]>([]);
  public favorites$: Observable<Product[]> = this.favoritesSubject.asObservable();
  public favoritesCount$!: Observable<number>;

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  constructor(private productsApiService: ProductsApiService) {
    // Derive favoritesCount$ from favorites$
    this.favoritesCount$ = this.favorites$.pipe(
      map(favorites => favorites.length)
    );
  }

  // These methods simulate direct interaction with a backend or data source
  // In your current setup, they modify the mock product list in ProductsApiService
  private _backendAddFavorite(productId: number | string): Observable<Product> {
    const product = this.productsApiService.allMockProducts.find(p => p.id === productId);
    if (product) {
      product.in_wishlist = true; // Update mock data source
      return of({ ...product, isFavorite: true }).pipe(delay(500)); // Return a copy
    }
    return throwError(() => new Error('Product not found for favoriting (backend sim)'));
  }

  private _backendRemoveFavorite(productId: number | string): Observable<void> {
    const product = this.productsApiService.allMockProducts.find(p => p.id === productId);
    if (product) {
      product.in_wishlist = false; // Update mock data source
      return of(undefined).pipe(delay(500)); // Simulate success
    }
    return throwError(() => new Error('Product not found for unfavoriting (backend sim)'));
  }

  // Method to load/refresh the list of favorite products
  public loadFavorites(): void {
    if (this.isLoadingSubject.value) {
      // Avoid multiple simultaneous loads if one is already in progress
      // console.log('Favorites loading already in progress.');
      return;
    }
    this.isLoadingSubject.next(true);
    this.productsApiService.getFavoriteProducts().pipe(
      tap(products => {
        this.favoritesSubject.next(products);
      }),
      catchError(err => {
        console.error('Failed to load favorites', err);
        this.favoritesSubject.next([]); // Emit empty array on error to clear list
        return throwError(() => err); // Re-throw error for subscribers to handle
      }),
      finalize(() => {
        this.isLoadingSubject.next(false);
      })
    ).subscribe(); // This subscription is for the service to perform the load.
                   // Components will subscribe to favorites$ or isLoading$.
  }

  // Public method for components to add a product to favorites
  public addFavorite(productId: number | string): Observable<Product> {
    // This observable is for the outcome of the "add" operation itself.
    return this._backendAddFavorite(productId).pipe(
      tap(addedProduct => {
        // After successful "backend" addition, refresh the favorites list
        this.loadFavorites();
      }),
      catchError(err => {
        console.error(`Service: Failed to add product ${productId} to favorites`, err);
        // Do not call loadFavorites() on error.
        return throwError(() => err);
      })
    );
  }

  // Public method for components to remove a product from favorites
  public removeFavorite(productId: number | string): Observable<void> {
    // This observable is for the outcome of the "remove" operation itself.
    return this._backendRemoveFavorite(productId).pipe(
      tap(() => {
        // After successful "backend" removal, refresh the favorites list
        this.loadFavorites();
      }),
      catchError(err => {
        console.error(`Service: Failed to remove product ${productId} from favorites`, err);
        // Do not call loadFavorites() on error.
        return throwError(() => err);
      })
    );
  }

  // Helper to check if a product is a favorite, useful for individual cards
  public isFavorite(productId: number | string): Observable<boolean> {
    return this.favorites$.pipe(
      map(favorites => favorites.some(p => p.id === productId))
    );
  }

  /**
   * Toggles the favorite status of a product.
   * If it's a favorite, it will be removed. If not, it will be added.
   * The underlying addFavorite/removeFavorite methods will trigger loadFavorites.
   * @param productId The ID of the product to toggle.
   * @returns An observable emitting an object indicating the action performed and product details.
   */
  public toggleFavorite(productId: number | string): Observable<{ action: 'added' | 'removed', product?: Product, productId: number | string }> {
    const currentFavorites = this.favoritesSubject.getValue(); // Get current state synchronously
    const isCurrentlyFavorite = currentFavorites.some(p => p.id === productId);

    if (isCurrentlyFavorite) {
      return this.removeFavorite(productId).pipe( // Calls public removeFavorite
        map(() => ({ action: 'removed' as const, productId }))
      );
    } else {
      return this.addFavorite(productId).pipe( // Calls public addFavorite
        map(addedProduct => ({ action: 'added' as const, product: addedProduct, productId }))
      );
    }
  }
}

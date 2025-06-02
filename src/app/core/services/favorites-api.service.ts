import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, EMPTY, Observable, switchMap, throwError} from 'rxjs';
import { catchError, tap, finalize, map } from 'rxjs/operators';
import { Product } from '../models/product';
import {AuthService} from './auth.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {CommonApiResponse} from '../models/common-api-response';
import {Url} from '../constants/base-url';
import {Wishlist} from '../../features/favorites/models/wishlist';
import {WishlistProduct} from '../../features/favorites/models/wishlist-product';
import {TranslateService} from '@ngx-translate/core';
import {MatDialog} from '@angular/material/dialog';
import {LoginComponent} from '../../features/auth/components/login/login.component';
import {FavoritesToggleResult} from '../../features/favorites/models/favorites-toggle-result';

@Injectable({
  providedIn: 'root'
})
export class FavoritesApiService {
  private http = inject(HttpClient);
  private authService = inject(AuthService); // Inject AuthService
  private dialog = inject(MatDialog); // Inject MatDialog
  private translate = inject(TranslateService); // Inject TranslateService

  private favoritesSubject = new BehaviorSubject<WishlistProduct[]>([]);
  public favorites$: Observable<WishlistProduct[]> = this.favoritesSubject.asObservable();
  public favoritesCount$!: Observable<number>;
  wishlist!: Wishlist | undefined; // Initialize wishlist arrays

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  private WISH_LIST_BASE_URL = '/api/product/wish_list/';
  private REMOVE_FROM_WISH_LIST_URL = '/api/product/wish_line/';

  constructor() {
    this.favoritesCount$ = this.favorites$.pipe(
      map(favorites => (favorites ? favorites.length : 0))
    );

    // Automatically load favorites if the user is authenticated
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.loadFavorites();
      } else {
        this.favoritesSubject.next([]); // Clear favorites if user logs out
        this.wishlist = undefined;
      }
    });
  }

  // Method to load/refresh the list of favorite products
  public loadFavorites(): void {
    const callId = Math.random().toString(36).substring(7); // Unique ID for this call
    console.log(`[FavoritesApiService - ${callId}] Entering loadFavorites. Current isLoading: ${this.isLoadingSubject.value}`);

    if (this.isLoadingSubject.value) {
      console.warn(`[FavoritesApiService - ${callId}] loadFavorites returning early because isLoading is true.`);
      return; // Avoid multiple simultaneous loads
    }
    this.isLoadingSubject.next(true);
    console.log(`[FavoritesApiService - ${callId}] loadFavorites set isLoading to true.`);

    const constructedUrl = Url.baseUrl + this.WISH_LIST_BASE_URL;
    console.log(`[FavoritesApiService - ${callId}] loadFavorites URL: ${constructedUrl}`);
    if (!Url.baseUrl) {
      console.error(`[FavoritesApiService - ${callId}] CRITICAL: Url.baseUrl is undefined!`);
      this.isLoadingSubject.next(false); // Attempt to reset
      return;
    }

    const headers = this.authService.getAuthHeaders();
    if (!headers.has('Authorization')) {
      console.warn(`[FavoritesApiService - ${callId}] No authorization token. Clearing favorites.`);
      this.favoritesSubject.next([]);
      this.isLoadingSubject.next(false);
      console.log(`[FavoritesApiService - ${callId}] loadFavorites (no auth) set isLoading to false.`);
      return;
    }

    this.http.get<any>(Url.baseUrl + this.WISH_LIST_BASE_URL, { headers }).pipe(
      map(response => {
        console.log(`[FavoritesApiService - ${callId}] loadFavorites received API response.`);
        // ... your existing map logic ...
        if (response && response.status && Array.isArray(response.data)) {
          let wishlistArray = response.data as Wishlist[]; // Renamed for clarity
          if (wishlistArray.length > 0) {
            let currentWishlist = wishlistArray[0];
            this.wishlist = currentWishlist;
            this.favoritesSubject.next(currentWishlist.lines || []); // Ensure lines is an array
          } else {
            this.wishlist = undefined; // Clear if no wishlist
            this.favoritesSubject.next([]);
            console.log(`[FavoritesApiService - ${callId}] No wishlist object in response. Emitting empty.`);
          }
        } else {
          this.wishlist = undefined; // Clear on bad response
          this.favoritesSubject.next([]);
          console.warn(`[FavoritesApiService - ${callId}] Failed to load favorites or bad format.`);
        }
      }),
      catchError(err => {
        console.error(`[FavoritesApiService - ${callId}] loadFavorites API Error:`, err);
        this.favoritesSubject.next([]);
        this.wishlist = undefined; // Clear on error
        return throwError(() => new Error('Failed to load favorites from API.'));
      }),
      finalize(() => {
        this.isLoadingSubject.next(false);
        console.log(`[FavoritesApiService - ${callId}] loadFavorites FINALIZED. isLoading set to false. Current: ${this.isLoadingSubject.value}`);
      })
    ).subscribe({
      next: () => console.log(`[FavoritesApiService - ${callId}] loadFavorites subscription: next`),
      error: (err) => console.error(`[FavoritesApiService - ${callId}] loadFavorites subscription: error:`, err)
    });
  }

  // Add a product to the wishlist
  private _backendAddFavorite(productId: number | string): Observable<WishlistProduct> {
    const callId = Math.random().toString(36).substring(7);
    console.log(`[FavoritesApiService - ${callId}] Entering _backendAddFavorite(${productId}). Current isLoading: ${this.isLoadingSubject.value}`);
    this.isLoadingSubject.next(true);
    console.log(`[FavoritesApiService - ${callId}] _backendAddFavorite set isLoading to true.`);
    const headers = this.authService.getAuthHeaders();

    if (!headers.has('Authorization')) {
      this.isLoadingSubject.next(false);
      return throwError(() => new Error('User not authenticated. Cannot add to favorites.'));
    }

    // API expects { "product_id": productId } in the body for the WISH_LIST_BASE_URL
    const body = { product: productId };

    return this.http.post<any>( Url.baseUrl + this.WISH_LIST_BASE_URL, body, { headers }).pipe(
      map(response => {
        console.log('[FavoritesApiService] Received add favorite response:', response);
        if (response && response.status && response.data) {
          this.isLoadingSubject.next(false);
          return response.data;
        }
        throw new Error(response.message || 'Failed to add product to wishlist via API.');
      }),
      catchError(err => {
        console.error(`[FavoritesApiService] API Error: Failed to add product ${productId} to favorites`, err);
        return throwError(() => err);
      }),
      finalize(() => {
        this.isLoadingSubject.next(false);
        console.log(`[FavoritesApiService - ${callId}] _backendAddFavorite FINALIZED. isLoading set to false. Current: ${this.isLoadingSubject.value}`);
      })
    );
  }

  // Remove a product from the wishlist
  private _backendRemoveFavorite(productId: number | string): Observable<void> {
    const callId = Math.random().toString(36).substring(7);
    console.log(`[FavoritesApiService - ${callId}] Entering _backendRemoveFavorite(${productId}). Current isLoading: ${this.isLoadingSubject.value}`);
    this.isLoadingSubject.next(true);
    console.log(`[FavoritesApiService - ${callId}] _backendRemoveFavorite set isLoading to true.`);
    const headers = this.authService.getAuthHeaders();

    if (!headers.has('Authorization')) {
      this.isLoadingSubject.next(false);
      return throwError(() => new Error('User not authenticated. Cannot remove from favorites.'));
    }

    // Defensive checks for wishlist data
    if (!this.wishlist || typeof this.wishlist.id === 'undefined') {
      console.error(`[FavoritesApiService - ${callId}] _backendRemoveFavorite: Wishlist data or ID is missing.`);
      this.isLoadingSubject.next(false); // Reset loading state
      return throwError(() => new Error('Wishlist data not available for removal.'));
    }

    let wishlistId = this.wishlist?.id
    let lineToRemove = this.wishlist?.lines.find(line => line.product === productId);
    if (!lineToRemove || typeof lineToRemove.id === 'undefined') {
      console.error(`[FavoritesApiService - ${callId}] _backendRemoveFavorite: Product line or line ID for product ${productId} not found.`);
      this.isLoadingSubject.next(false); // Reset loading state
      return throwError(() => new Error('Product line not found in wishlist for removal.'));
    }
    const lineToRemoveId = lineToRemove.id;

    let params = new HttpParams().set('wishlist', wishlistId.toString());

    return this.http.delete<CommonApiResponse>( Url.baseUrl + this.REMOVE_FROM_WISH_LIST_URL + lineToRemoveId, { params :params, headers:headers }).pipe(
      map(response => {
        console.log('[FavoritesApiService] Received remove favorite response:', response);
        if (response && response.status) {
          this.isLoadingSubject.next(false);
          return; // Success
        }
        throw new Error(response.message || 'Failed to remove product from wishlist via API.');
      }),
      catchError(err => {
        console.error(`[FavoritesApiService] API Error: Failed to remove product ${productId} from favorites`, err);
        return throwError(() => err);
      }),
      finalize(() => {
        this.isLoadingSubject.next(false);
        console.log(`[FavoritesApiService - ${callId}] _backendRemoveFavorite FINALIZED. isLoading set to false. Current: ${this.isLoadingSubject.value}`);
      })
    );
  }

  // Public method for components to add a product to favorites
  public addFavorite(productId: number | string): Observable<WishlistProduct> {
    console.log(`[FavoritesApiService] addFavorite(${productId})`);
    return this._backendAddFavorite(productId).pipe(
      tap((addedWishlistProduct) => {
        this.loadFavorites(); // Reloads the entire list from the server
      }),
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

  // Public method for components to remove a product from favorites
  public removeFavorite(productId: number | string): Observable<void> {
    return this._backendRemoveFavorite(productId).pipe(
      tap(() => {
        this.loadFavorites(); // Reloads the entire list from the server
      }),
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

  /// Helper to check if a product is a favorite (renamed from in_wishlist)
  public isFavorite(productId: number | string): Observable<boolean> {
    return this.favorites$.pipe(
      map(favorites => favorites.some(p => p.product_detail.id === productId))
    );
  }

  public toggleFavorite(productId: number | string): Observable<{ action: 'added' | 'removed', product?: Product, productId: number | string }> {
    console.log(`[FavoritesApiService] toggleFavorite(${productId})`);
    const isCurrentlyFavorite = this.favoritesSubject.getValue().some(wp => wp.product_detail.id === productId);

    if (isCurrentlyFavorite) {
      return this.removeFavorite(productId).pipe(
        map(() => ({ action: 'removed' as const, productId }))
      );
    } else {
      return this.addFavorite(productId).pipe( // This now returns Observable<WishlistProduct>
        map(addedWishlistProduct => ({ // addedWishlistProduct is WishlistProduct
          action: 'added' as const,
          product: addedWishlistProduct.product_detail, // Extract Product from WishlistProduct
          wishlistProduct: addedWishlistProduct,
          productId
        }))
      );
    }
  }

  /**
   * Toggles the favorite status of a product.
   * If the user is not authenticated, it prompts them to log in.
   * After successful login, it re-attempts the toggle action.
   * @param productId The ID of the product to toggle.
   * @returns An Observable emitting the result of the toggle action.
   */
  public toggleFavoriteWithAuthPrompt(productId: number | string): Observable<FavoritesToggleResult> {
    if (this.authService.isAuthenticatedSync()) {
      return this.toggleFavorite(productId);
    } else {
      const dialogRef = this.dialog.open(LoginComponent, {
        width: '450px',
        maxWidth: '90vw',
        data: {
          preambleMessage: this.translate.instant('auth.loginToFavoritePrompt')
        }
      });

      return dialogRef.afterClosed().pipe(
        switchMap(loginResult => {
          if (loginResult?.loggedIn) {
            // Login successful, now attempt to toggle favorite
            return this.toggleFavorite(productId);
          } else {
            // Login cancelled or failed
            return EMPTY; // Completes the observable chain without further action
          }
        })
      );
    }
  }
}

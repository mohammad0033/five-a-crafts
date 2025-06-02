import {inject, Injectable} from '@angular/core';
import {ProductsApiService} from './products-api.service';
import {catchError, map, Observable, of, switchMap, throwError} from 'rxjs';
import {Product} from '../models/product';
import {PaginatedApiObject} from '../models/paginated-api-object';
import {CommonApiResponse} from '../models/common-api-response';
import {ProductDetailsData} from '../../features/product-details/models/product-details-data';
import {SortOption} from '../../features/products/components/container/products.component';
import {PaginatedProductsResponse} from '../models/paginated-products-response';
import {Router} from '@angular/router';
import {ReviewsData} from '../../features/product-details/models/reviews-data';
import {TranslateService} from '@ngx-translate/core';
import {AuthService} from './auth.service';
import {MatDialog} from '@angular/material/dialog';
import {Review} from '../../features/product-details/models/review';
import {LoginComponent} from '../../features/auth/components/login/login.component';
import {ReviewPayload} from '../../features/product-details/models/review-payload';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private productsApiService = inject(ProductsApiService);
  private router = inject(Router);
  private authService = inject(AuthService); // For addReviewWithAuthPrompt
  private dialog = inject(MatDialog);       // For addReviewWithAuthPrompt
  private translate = inject(TranslateService); // For addReviewWithAuthPrompt

  // Assuming a max rating of 5 stars for reviews
  private readonly MAX_REVIEW_RATING = 5;

  constructor() { }

  getCategoryProducts(categoryId: string): Observable<Product[]> {
    return this.productsApiService.getCategoryProducts(categoryId).pipe(
      map(response => { // Use the 'map' operator to transform the response
        if (response && typeof response.data === 'object' && response.data !== null ) {
          let paginatedResponse = response.data as PaginatedApiObject;
          console.log('Paginated API response results:', paginatedResponse.results);
          return paginatedResponse.results as Product[]; // Extract and return the array from the 'data' property
          // return response.data as Product[]; // Extract and return the array from the 'data' property
        } else {
          // Handle cases where the response or data is not in the expected format
          console.error('Unexpected API response format:', response);
          return []; // Or throw an error: throw new Error('Invalid categories data');
        }
      })
    );
  }

  /**
   * Fetches product details by slug and extracts the ProductDetailsData.
   * Returns null if the product is not found or an error occurs.
   */
  getProductDetails(productSlug: string): Observable<ProductDetailsData | null> {
    return this.productsApiService.getProductDetails(productSlug).pipe(
      map((response: CommonApiResponse) => {
        if (response && typeof response.data === 'object') {
          return response.data as ProductDetailsData;
        } else {
          console.warn(`Product details not found or invalid response for slug "${productSlug}":`, response);
          return null;
        }
      }),
      catchError(error => {
        console.error(`Error fetching product details for slug "${productSlug}" in ProductsService:`, error);
        return of(null); // Return null on error to be handled by the resolver/component
      })
    );
  }


  getProducts(
    page?: number,
    page_size?: number,
    categories?: number[],
    colors?: string[],
    searchQuery?: string,
    sortOption?: SortOption
  ): Observable<PaginatedProductsResponse> {
    return this.productsApiService.getProducts(page, page_size, categories, colors, searchQuery, sortOption).pipe(
      map(response => {
        if (response && typeof response.data === 'object' && response.data !== null) {
          // Assuming response.data is your PaginatedApiObject which includes 'count' and 'results'
          const paginatedData = response.data as PaginatedApiObject;
          if (paginatedData && Array.isArray(paginatedData.results)) {
            return {
              products: paginatedData.results,
              totalCount: paginatedData.count
            };
          }
        }
        // Handle cases where the response or data is not in the expected format
        console.error('Unexpected API response format in ProductsService.getProducts:', response);
        return { products: [], totalCount: 0 }; // Return a default empty response
      }),
      catchError(error => {
        console.error('Error fetching products in ProductsService:', error);
        this.router.navigate(['/not-found']);
        return of({ products: [], totalCount: 0 }); // Return a default empty response on error
      })
    );
  }

  /**
   * Calculates review summary statistics from a list of reviews.
   * @param reviewsList The array of Review objects.
   * @returns A ReviewsData object with calculated summaries.
   */
  private _calculateReviewsSummary(reviewsList: Review[] | null): ReviewsData { // Changed return to non-nullable for simplicity, handles null input
    if (!reviewsList || reviewsList.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: [],
        reviewsList: []
      };
    }

    const totalReviews = reviewsList.length;
    let sumOfRatings = 0;
    const ratingCounts: { [key: number]: number } = {};

    for (let i = 1; i <= this.MAX_REVIEW_RATING; i++) {
      ratingCounts[i] = 0;
    }

    reviewsList.forEach(review => {
      sumOfRatings += review.score; // Assuming 'score' is the rating field in Review model
      if (review.score >= 1 && review.score <= this.MAX_REVIEW_RATING) {
        ratingCounts[review.score]++;
      }
    });

    const averageRating = totalReviews > 0 ? parseFloat((sumOfRatings / totalReviews).toFixed(1)) : 0;

    const ratingDistribution = [];
    for (let stars = this.MAX_REVIEW_RATING; stars >= 1; stars--) {
      ratingDistribution.push({ stars: stars, count: ratingCounts[stars] || 0 });
    }

    return {
      totalReviews,
      averageRating,
      ratingDistribution,
      reviewsList: reviewsList
    };
  }

  /**
   * Fetches reviews for a product and transforms them into the ReviewsData structure.
   * @param productId The ID of the product.
   * @returns An Observable of ReviewsData.
   *          The ReviewsData object will have zeroed summary fields and an empty reviewsList if no reviews are found or an error occurs.
   */
  getProductReviews(productId: number): Observable<ReviewsData> { // Return type changed to Observable<ReviewsData>
    return this.productsApiService.getProductReviews(productId).pipe(
      map(response => {
        if (response && response.status && Array.isArray(response.data)) {
          // Assuming response.data from ProductsApiService is Review[]
          const reviewsList = response.data as Review[];
          return this._calculateReviewsSummary(reviewsList);
        }
        // If API indicates success but data is not an array (e.g., null for no reviews)
        if (response && response.status && response.data === null) {
          return this._calculateReviewsSummary(null); // Calculate summary for no reviews
        }
        console.warn(`[ProductsService] Product reviews not found or invalid response format for product ID "${productId}":`, response.message || response);
        return this._calculateReviewsSummary(null); // Return default empty summary
      }),
      catchError(error => {
        console.error(`[ProductsService] Error fetching product reviews for product ID "${productId}":`, error);
        return of(this._calculateReviewsSummary(null)); // Return default empty summary on error
      })
    );
  }

  /**
   * Orchestrates adding a review, including authentication check and login prompt.
   * @param productId The ID of the product being reviewed.
   * @param reviewPayload The review data from the form.
   * @returns An Observable emitting the added Review or null if login was cancelled/failed.
   */
  addReviewWithAuthPrompt(productId: number, reviewPayload: ReviewPayload): Observable<Review | null> {
    if (this.authService.isAuthenticatedSync()) {
      return this.productsApiService.addProductReview(
        productId,
        reviewPayload.title,
        reviewPayload.score, // This is 'score' for the API
        reviewPayload.body // This is 'body' for the API
      ).pipe(
        catchError(err => {
          // Error is already logged by ProductsApiService
          return throwError(() => err); // Propagate error
        })
      );
    } else {
      const dialogRef = this.dialog.open(LoginComponent, {
        width: '450px',
        maxWidth: '90vw',
        data: {
          preambleMessage: this.translate.instant('auth.loginToReviewPrompt')
        }
      });

      return dialogRef.afterClosed().pipe(
        switchMap(loginResult => {
          if (loginResult?.loggedIn) {
            console.log('[ProductsService] User logged in. Attempting to add review.');
            return this.productsApiService.addProductReview(
              productId,
              reviewPayload.title,
              reviewPayload.score,
              reviewPayload.body
            );
          } else {
            console.log('[ProductsService] Login cancelled or failed. Review not submitted.');
            return of(null); // Indicate review process was halted
          }
        }),
        catchError(err => {
          console.error('[ProductsService] Error adding review after login attempt:', err);
          return throwError(() => err);
        })
      );
    }
  }
}

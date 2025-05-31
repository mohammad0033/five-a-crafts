import {Injectable} from '@angular/core';
import {ProductsApiService} from './products-api.service';
import {catchError, map, Observable, of, tap} from 'rxjs';
import {Product} from '../models/product';
import {PaginatedApiObject} from '../models/paginated-api-object';
import {CommonApiResponse} from '../models/common-api-response';
import {ProductDetailsData} from '../../features/product-details/models/product-details-data';
import {SortOption} from '../../features/products/components/container/products.component';
import {PaginatedProductsResponse} from '../models/paginated-products-response';
import {Router} from '@angular/router';
import {ReviewsData} from '../../features/product-details/models/reviews-data';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private productsApiService: ProductsApiService,
              private router: Router) { }

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

  getProductReviews(productId: number): Observable<ReviewsData[]> {
    return this.productsApiService.getProductReviews(productId).pipe(
      map(response => {
        if (response && Array.isArray(response.data)) {
          return response.data as ReviewsData[];
        }
        // Handle cases where the response or data is not in the expected format
        console.error('Unexpected API response format in ProductsService.getProductReviews:', response);
        return []; // Return a default empty response
      }),
      catchError(error => {
        console.error('Error fetching product reviews in ProductsService:', error);
        return of([]); // Return a default empty response on error
      })
    )
  }

  addProductReview(productId: number, title: string, score: number, body: string): Observable<CommonApiResponse | null> {
    return this.productsApiService.addProductReview(productId, title, score, body).pipe(
      tap(response => {
        console.log('Product review added successfully:', response);
      }),
      catchError(error => {
        console.error('Error adding product review in ProductsService:', error);
        return of(null); // Return a default null response on error
      })
    );
  }
}

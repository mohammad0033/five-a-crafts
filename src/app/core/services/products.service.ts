import {Injectable} from '@angular/core';
import {ProductsApiService} from './products-api.service';
import {catchError, map, Observable, of} from 'rxjs';
import {Product} from '../models/product';
import {PaginatedApiObject} from '../models/paginated-api-object';
import {CommonApiResponse} from '../models/common-api-response';
import {ProductDetailsData} from '../../features/product-details/models/product-details-data';
import {Color} from '../models/color';
import {SortOption} from '../../features/products/components/container/products.component';
import {PaginatedProductsResponse} from '../models/paginated-products-response';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private productsApiService: ProductsApiService,private router: Router) { }

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

  /**
   * Fetches all filterable product colors.
   */
  getFilterableColors(): Observable<Color[]> {
    return this.productsApiService.getProductFilterColors().pipe(
      map(response => {
        if (response && response.data) {
          // Adjust based on your API response structure.
          // If response.data is directly Color[]:
          // return response.data as Color[];

          // If response.data is PaginatedApiObject containing colors:
          const paginatedData = response.data as PaginatedApiObject; // Or your specific paginated type
          if (Array.isArray(paginatedData.results)) {
            return paginatedData.results as Color[];
          }
          // If response.data is directly an array (non-paginated)
          if (Array.isArray(response.data)) {
            return response.data as Color[];
          }
        }
        console.error('Unexpected API response format for colors:', response);
        return [];
      }),
      catchError(error => {
        console.error('Error fetching filterable colors in ProductsService:', error);
        return of([]); // Return empty array on error
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
}

import {Injectable} from '@angular/core';
import {ProductsApiService} from './products-api.service';
import {catchError, map, Observable, of} from 'rxjs';
import {Product} from '../models/product';
import {PaginatedApiObject} from '../models/paginated-api-object';
import {CommonApiResponse} from '../models/common-api-response';
import {ProductDetailsData} from '../../features/product-details/models/product-details-data';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private productsApiService: ProductsApiService) { }

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
}

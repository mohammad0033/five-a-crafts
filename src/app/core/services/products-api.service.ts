import {inject, Injectable} from '@angular/core';
import {catchError, map, Observable, throwError} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {CommonApiResponse} from '../models/common-api-response';
import {Url} from '../constants/base-url';
import {SortOption} from '../../features/products/components/container/products.component';
import {AuthService} from './auth.service';
import {Review} from '../../features/product-details/models/review';

@Injectable({
  providedIn: 'root'
})
export class ProductsApiService {
  private http = inject(HttpClient);
  private authService = inject(AuthService); // Injected if needed for addReview headers

  getBestSellingProducts(): Observable<CommonApiResponse> {
    let params = new HttpParams().set('category', 6); // category id 6 represents best-selling products
    return this.http.get<CommonApiResponse>(`${Url.baseUrl}/api/oscar/products/`, { params: params });
  }

  getCategoryProducts(categoryId: string): Observable<CommonApiResponse> {
    let params = new HttpParams().set('category', categoryId);
    return this.http.get<CommonApiResponse>(`${Url.baseUrl}/api/oscar/products/`, { params: params });
  }

  // Rename method to reflect it fetches full details
  getProductDetails(productSlug: string): Observable<CommonApiResponse> {
    return this.http.get<CommonApiResponse>(`${Url.baseUrl}/api/oscar/products/${productSlug}`);
  }

  getProductReviews(productId: number): Observable<CommonApiResponse> {
    let params = new HttpParams().set('product', productId);
    return this.http.get<CommonApiResponse>(`${Url.baseUrl}/api/product/review/`, { params: params });
  }

  addProductReview(productId: number, title: string, score: number, body: string): Observable<Review> {
    const reviewPayload = { product: productId, title: title, score: score, body: body };
    const headers = this.authService.getAuthHeaders(); // Assuming reviews require authentication

    return this.http.post<any>(`${Url.baseUrl}/api/product/review/`, reviewPayload, { headers }).pipe(
      map(response => {
        if (response && response.status && response.data) {
          return response.data; // Extract the Review object
        }
        throw new Error(response?.message || 'Failed to add review or API response format incorrect.');
      }),
      catchError(err => {
        const errorMessage = err.error?.message || err.message || 'An unknown error occurred while adding the review.';
        console.error(`[ProductsApiService] API Error: Failed to add review for product ${productId}:`, errorMessage, err);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getProducts(page?: number,
              page_size?: number,
              categories?:number[],
              colors?:string[],
              searchQuery?: string,
              sortOption?: SortOption): Observable<CommonApiResponse> {
    let params = new HttpParams();

    if (page) {
      params = params.set('page', page.toString());
    }

    if (page_size) {
      params = params.set('page_size', page_size.toString());
    }

    if (categories && categories.length > 0) {
      params = params.set('category', categories.join(','));
    }

    if (colors && colors.length > 0) {
      params = params.set('colors', colors.join(','));
    }

    if (searchQuery && searchQuery.trim() !== '') {
      params = params.set('title', searchQuery.trim());
    }

    if (sortOption) {
      let apiSortParam = '';
      // Map your SortOption enum to API-expected 'ordering' values
      // Example: Django REST framework often uses 'field' for asc, '-field' for desc
      switch (sortOption) {
        case SortOption.NAME_ASC: apiSortParam = 'title'; break; // Assuming API field is 'title'
        case SortOption.NAME_DESC: apiSortParam = '-title'; break;
        case SortOption.PRICE_ASC: apiSortParam = 'stockrecords__price'; break; // Or 'price'
        case SortOption.PRICE_DESC: apiSortParam = '-stockrecords__price'; break; // Or '-price'
      }
      if (apiSortParam) {
        params = params.set('ordering', apiSortParam);
      }
    }

    return this.http.get<CommonApiResponse>(`${Url.baseUrl}/api/oscar/products/`, { params: params });
  }
}

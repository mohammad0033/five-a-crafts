import { Injectable } from '@angular/core';
import {ContentApiService} from '../../../core/services/content-api.service';
import {map, Observable, tap} from 'rxjs';
import {CarouselItem} from '../models/carousel-item';
import {CategoriesApiService} from '../../../core/services/categories-api.service';
import {Category} from '../../../core/models/category';
import {CommonApiResponse} from '../../../core/models/common-api-response';
import {Product} from '../../../core/models/product';
import {PaginatedApiObject} from '../../../core/models/paginated-api-object';
import {ProductsApiService} from '../../../core/services/products-api.service';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  // Inject ContentApiService
  constructor(private contentApiService: ContentApiService,
              private productsApiService: ProductsApiService,
              private categoriesApiService: CategoriesApiService) { }

  /**
   * Gets the data needed for the hero carousel.
   * Delegates the actual fetching/simulation to ContentApiService.
   */
  getHeroCarouselData(): Observable<CarouselItem[]> {
    return this.contentApiService.getHomeCarouselData().pipe(
      tap (data => console.log(data)),
      map((response:CommonApiResponse) => response.data as CarouselItem[])
    )
  }

  getBestSellingProducts(): Observable<Product[]> {
    return this.productsApiService.getBestSellingProducts().pipe(
      map((response:CommonApiResponse) => { // Use the 'map' operator to transform the response
        console.log('Best selling products data:', response);
        if (response && typeof response.data === 'object' && response.data !== null) {
          let paginatedResponse = response.data as PaginatedApiObject;
          console.log('Paginated API response results:', paginatedResponse.results);
          return paginatedResponse.results as Product[];
        } else {
          // Handle cases where the response or data is not in the expected format
          console.error('Unexpected API response format:', response);
          return []; // Or throw an error: throw new Error('Invalid categories data');
        }
      })
    );
  }

  getCategoriesData(): Observable<Category[]> {
    return this.categoriesApiService.getCategoriesData().pipe(
      map((response:CommonApiResponse) => { // Use the 'map' operator to transform the response
        if (response && Array.isArray(response.data)) {
          return response.data.slice(0, 4) as Category[]; // Return the first 4 items from the 'data' property
        } else {
          // Handle cases where the response or data is not in the expected format
          console.error('Unexpected API response format:', response);
          return []; // Or throw an error: throw new Error('Invalid categories data');
        }
      })
    );
  }

  // getHomePageData(): Observable<HomePageData> {
  //   return forkJoin({
  //     featuredProducts: this.productService.getFeaturedProducts(5),
  //     promotions: this.promotionService.getActiveBanners(3),
  //     topCategories: this.categoryService.getTopCategories(4)
  //   }).pipe(
  //     map(results => ({
  //       featuredProducts: results.featuredProducts,
  //       promotions: results.promotions,
  //       topCategories: results.topCategories
  //     }))
  //   );
  // }
}

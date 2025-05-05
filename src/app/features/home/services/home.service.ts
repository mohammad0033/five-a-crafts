import { Injectable } from '@angular/core';
import {ContentApiService} from '../../../core/services/content-api.service';
import {Observable} from 'rxjs';
import {CarouselItem} from '../models/carousel-item';
import {CategoriesApiService} from '../../../core/services/categories-api.service';
import {Category} from '../../../core/models/category';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  // Inject ContentApiService
  constructor(private contentApiService: ContentApiService,
              private categoriesApiService: CategoriesApiService) { }

  /**
   * Gets the data needed for the hero carousel.
   * Delegates the actual fetching/simulation to ContentApiService.
   */
  getHeroCarouselData(): Observable<CarouselItem[]> {
    return this.contentApiService.getCarouselData();
  }

  getCategoriesData(): Observable<Category[]> {
    return this.categoriesApiService.getCategoriesData();
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

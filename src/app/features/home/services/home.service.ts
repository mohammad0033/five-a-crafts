import { Injectable } from '@angular/core';
import {ContentService} from '../../../core/services/content.service';
import {Observable} from 'rxjs';
import {CarouselItem} from '../models/carousel-item';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  // Inject ContentService
  constructor(private contentService: ContentService) { }

  /**
   * Gets the data needed for the hero carousel.
   * Delegates the actual fetching/simulation to ContentService.
   */
  getHeroCarouselData(): Observable<CarouselItem[]> {
    return this.contentService.getCarouselData();
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

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor() { }

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

import { Injectable } from '@angular/core';
import {delay, Observable, of} from 'rxjs';
import {PageMetadata} from '../models/page-meta-data';
import {HttpClient, HttpParams} from '@angular/common/http';
import {CommonApiResponse} from '../models/common-api-response';
import {Url} from '../constants/base-url';

// // Inside content-api.service.ts or types.ts
// export interface MegaMenuItem {
//   label: string;
//   link: string;
//   isShopAll?: boolean; // Optional flag for the "Shop All" item
// }
//
// export interface MegaMenuColumn {
//   header: string;
//   items: MegaMenuItem[];
// }
//
// export type MegaMenuData = MegaMenuColumn[];

@Injectable({
  providedIn: 'root'
})
export class ContentApiService {

  constructor(private http: HttpClient) { }

  /**
   * Simulates fetching mega menu data from an API.
   * Returns an Observable of MegaMenuData.
   */

  getHomePageMetadata(): Observable<PageMetadata> {
    // Mock data - replace with actual API call eventually
    const mockMetadata: PageMetadata = {
      title: 'API: Five A Crafts | Handcrafted & Sustainable', // Example API title
      description: 'API: Shop unique, artisan-crafted, sustainable goods at Five A Crafts. Bring warmth to your home.', // Example API description
      // Optionally provides specific image URLs from API
      // ogImageUrl: 'https://api.yourdomain.com/images/home-og.jpg',
      // twitterImageUrl: 'https://api.yourdomain.com/images/home-twitter.jpg'
    };

    // Simulate network delay
    // In a real scenario: return this.http.get<PageMetadata>('/api/metaData/home');
    return of(mockMetadata).pipe(delay(300)); // Simulate 300ms delay
  }

  getHomeCarouselData(): Observable<CommonApiResponse> {
    let params = new HttpParams().set('section', 1);
    return this.http.get<CommonApiResponse>(`${Url.baseUrl}/api/ads/`, { params: params });
  }

  getAboutPageMetadata(): Observable<PageMetadata> {
    const mockMetadata: PageMetadata = {
      title: 'API: About Five A Crafts | Our Story & Mission',
      description: 'API: Learn about Five A Crafts, our dedication to sustainable practices, and the artisans behind our unique products.',
      // ogImageUrl: 'https://api.yourdomain.com/images/about-og.jpg', // Optional specific image
    };
    // Simulate network delay
    return of(mockMetadata).pipe(delay(250)); // Simulate delay
  }

  getCategoriesPageMetadata(): Observable<PageMetadata> {
    const mockMetadata: PageMetadata = {
      title: 'API: Shop by Category | Five A Crafts',
      description: 'API: Browse all product categories available at Five A Crafts, including candles, gifts, home decor, and craft supplies.',
      // ogImageUrl: 'https://api.yourdomain.com/images/categories-og.jpg',// Optional specific image
    };
    return of(mockMetadata).pipe(delay(200)); //Simulate delay
  }

  getProductsPageMetadata(): Observable<PageMetadata> {
    const mockMetadata: PageMetadata = {
      title: 'API: Shop by Product | Five A Crafts',
      description: 'API: Browse all products available at Five A Crafts, including candles, gifts, home decor, and craft supplies.',
      // ogImageUrl: 'https://api.yourdomain.com/images/products-og.jpg', // Optional specific image
    };
    // Simulate network delay
    return of(mockMetadata).pipe(delay(200)); // Simulate delay
  }

  getContactPageMetadata(): Observable<PageMetadata> {
    const mockMetadata: PageMetadata = {
      title: 'API: Contact Five A Crafts | Get in Touch',
      description: 'API: Have questions or need support? Contact the Five A Crafts team via our contact form, email, or phone.',
      // ogImageUrl: 'https://api.yourdomain.com/images/contact-og.jpg', // Optional specific image
    };
    // Simulate network delay
    return of(mockMetadata).pipe(delay(200)); // Simulate delay
  }
}

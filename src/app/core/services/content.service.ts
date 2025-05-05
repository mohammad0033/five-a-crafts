import { Injectable } from '@angular/core';
import {delay, Observable, of} from 'rxjs';
import {CarouselItem} from '../../features/home/models/carousel-item';
import {CategoryItem} from '../../features/home/models/category-item';
import {PageMetadata} from '../models/page-meta-data';

// Inside content.service.ts or types.ts
export interface MegaMenuItem {
  label: string;
  link: string;
  isShopAll?: boolean; // Optional flag for the "Shop All" item
}

export interface MegaMenuColumn {
  header: string;
  items: MegaMenuItem[];
}

export type MegaMenuData = MegaMenuColumn[];

@Injectable({
  providedIn: 'root'
})
export class ContentService {

  constructor() { }

  /**
   * Simulates fetching mega menu data from an API.
   * Returns an Observable of MegaMenuData.
   */
  getMegaMenuData(): Observable<MegaMenuData> {
    // Mock data based on your current navbar.component.html structure
    const mockData: MegaMenuData = [
      {
        header: 'Candles',
        items: [
          { label: 'Scented Jar Candles', link: '#' },
          { label: 'Pillar Candles', link: '#' },
          { label: 'Votive Candles', link: '#' },
          { label: 'Tealight Candles', link: '#' },
          { label: 'Taper Candles', link: '#' },
          { label: 'Shop All Candles', link: '#', isShopAll: true } // Mark the "Shop All" item
        ]
      },
      {
        header: 'Gifts',
        items: [
          { label: 'Gift Sets', link: '#' },
          { label: 'Personalized Gifts', link: '#' },
          { label: 'Gifts Under $25', link: '#' },
          { label: 'Corporate Gifts', link: '#' },
          { label: 'Occasion Gifts', link: '#' },
          { label: 'Shop All Gifts', link: '#', isShopAll: true }
        ]
      },
      {
        header: 'Home Decor',
        items: [
          { label: 'Wall Art', link: '#' },
          { label: 'Vases', link: '#' },
          { label: 'Figurines', link: '#' },
          { label: 'Photo Frames', link: '#' },
          { label: 'Decorative Bowls', link: '#' },
          { label: 'Shop All Decor', link: '#', isShopAll: true }
        ]
      },
      {
        header: 'Craft Supplies',
        items: [
          { label: 'Beads & Jewelry', link: '#' },
          { label: 'Yarn & Needlecraft', link: '#' },
          { label: 'Painting Supplies', link: '#' },
          { label: 'Paper Crafts', link: '#' },
          { label: 'Wood Crafts', link: '#' },
          { label: 'Shop All Craft Supplies', link: '#', isShopAll: true }
        ]
      }
    ];

    // Use `of` to create an observable that immediately emits the mock data
    // In a real scenario, this would be an HttpClient call:
    // return this.http.get<MegaMenuData>('/api/mega-menu-data');
    return of(mockData);
  }

  /**
   * Simulates fetching hero carousel data from an API.
   * Returns an Observable of CarouselItem array.
   */
  getCarouselData(): Observable<CarouselItem[]> {
    // Mock data for the carousel
    const mockCarouselData: CarouselItem[] = [
      {
        imageUrl: 'https://picsum.photos/id/944/1200/500', // Use larger images if needed
        title: 'Artisan-made goods for your home and heart.',
        title2: 'Discover Unique, Handcrafted Treasures',
        description: 'We create beautiful, one-of-a-kind crafts using sustainable materials and traditional techniques. Each piece tells a story.',
        altText: 'Artisan candles arranged beautifully'
      },
      {
        imageUrl: 'https://picsum.photos/id/1011/1200/500',
        title: 'Perfect Gifts for Every Occasion',
        title2: 'Discover Unique, Handcrafted Treasures',
        description: 'We create beautiful, one-of-a-kind crafts using sustainable materials and traditional techniques. Each piece tells a story.',
        altText: 'Gift boxes wrapped elegantly'
      },
      {
        imageUrl: 'https://picsum.photos/id/984/1200/500',
        title: 'Spruce Up Your Home Decor',
        title2: 'Discover Unique, Handcrafted Treasures',
        description: 'We create beautiful, one-of-a-kind crafts using sustainable materials and traditional techniques. Each piece tells a story.',
        altText: 'Modern home decor items on a shelf'
      }
    ];

    // Use `of` and `delay` to simulate a network request
    // In a real scenario, this would be an HttpClient call:
    // return this.http.get<CarouselItem[]>('/api/carousel-data');
    return of(mockCarouselData).pipe(delay(500)); // Simulate 500ms delay
  }

  getCategoriesData(): Observable<any[]> {

    const mockCategoriesData: CategoryItem[] = [
      {
        id: 1,
        name: 'Candles',
        image: 'https://picsum.photos/id/1063/300/300'
      },
      {
        id: 2,
        name: 'Decor',
        image: 'https://picsum.photos/id/1064/300/300'
      },
      {
        id: 3,
        name: 'Ramadan',
        image: 'https://picsum.photos/id/1065/300/300'
      },
      {
        id: 4,
        name: 'Gifts',
        image: 'https://picsum.photos/id/1066/300/300'
      }
    ]

    // Use `of` and `delay` to simulate a network request
    // In a real scenario, this would be an HttpClient call:
    // return this.http.get<CategoriesItem[]>('/api/carousel-data');
    return of(mockCategoriesData).pipe(delay(500)); // Simulate 500ms delay
  }

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
    // In a real scenario: return this.http.get<PageMetadata>('/api/metadata/home');
    return of(mockMetadata).pipe(delay(300)); // Simulate 300ms delay
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

import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';

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
}

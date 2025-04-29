import { Injectable } from '@angular/core';
import {delay, Observable, of} from 'rxjs';
import {Product} from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor() { }

  /**
   * Simulates fetching best-selling products from an API.
   * Returns an Observable of Product array.
   */
  getBestSellingProducts(): Observable<Product[]> {
    // Mock data for best-selling products
    const mockBestSellers: Product[] = [
      { id: 1, name: 'Lavender Bliss Candle', description:'test description test description test description test description test description test description test description test description ', imageUrl: 'https://picsum.photos/id/1060/300/300', price: 15.99, altText: 'A calming lavender scented candle' },
      { id: 2, name: 'Ocean Breeze Pillar', description:'test description test description test description test description test description test description test description test description ', imageUrl: 'https://picsum.photos/id/1061/300/300', price: 12.50, isFavorite: true, altText: 'A blue pillar candle' },
      { id: 3, name: 'Vanilla Dream Votive Set', description:' test description test description test description ', imageUrl: 'https://picsum.photos/id/1062/300/300', price: 9.99, altText: 'Set of small vanilla votive candles' },
      { id: 4, name: 'Cozy Cabin Tealights', description:'test description', imageUrl: 'https://picsum.photos/id/1063/300/300', price: 5.49, altText: 'Pack of tealight candles' },
      { id: 5, name: 'Elegant Taper Candles (Pair)', description:'test description test description test description test description test description test description test description test description ', imageUrl: 'https://picsum.photos/id/1064/300/300', price: 8.00, altText: 'Two tall taper candles' },
      { id: 6, name: 'Mystery Scent Jar', description:'test description test description test description test description test description test description test description test description ', imageUrl: 'https://picsum.photos/id/1065/300/300', price: 18.00, altText: 'A jar candle with a question mark' },
      { id: 7, name: 'Autumn Spice Delight', description:'test description test description test description test description test description test description test description test description ', imageUrl: 'https://picsum.photos/id/1066/300/300', price: 16.50, altText: 'An orange candle with autumn spices' },
    ];

    // Use `of` and `delay` to simulate a network request
    // In a real scenario, this would be an HttpClient call:
    // return this.http.get<Product[]>('/api/products/bestsellers');
    return of(mockBestSellers).pipe(delay(800)); // Simulate 800ms delay
  }
}

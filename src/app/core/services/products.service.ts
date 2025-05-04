import { Injectable } from '@angular/core';
import {delay, Observable, of, throwError} from 'rxjs';
import {Product} from '../models/product';
import {ProductDetailsData} from '../../features/product-details/models/product-details-data';

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

  getCandlesCollectionProducts(): Observable<Product[]> {
    // Mock data for candles collection products
    const mockCandlesCollection: Product[] = [
      { id: 1, name: 'Lavender Bliss Candle', description:'test description test description test description test description test description test description test description test description ', imageUrl: 'https://picsum.photos/id/1060/300/300', price: 15.99, altText: 'A calming lavender scented candle' },
      { id: 2, name: 'Ocean Breeze Pillar', description:'test description test description test description', imageUrl: 'https://picsum.photos/id/1061/300/300', price: 12.50, isFavorite: true, altText: 'A blue pillar candle' },
      { id: 3, name: 'Vanilla Dream Votive Set', description:'test description test description', imageUrl: 'https://picsum.photos/id/1062/300/300', price: 9.99, altText: 'Set of small vanilla votive candles' },
      { id: 4, name: 'Cozy Cabin Tealights', description:'test description', imageUrl: 'https://picsum.photos/id/1063/300/300', price: 5.49, altText: 'Pack of tealight candles' },
      { id: 5, name: 'Elegant Taper Candles (Pair)', description:'test description test description test description test description test description test description test description test description ', imageUrl: 'https://picsum.photos/id/1064/300/300', price: 8.00, altText: 'Two tall taper candles' },
      { id: 6, name: 'Mystery Scent Jar', description:'test description test', imageUrl: 'https://picsum.photos/id/1065/300/300', price: 18.00, altText: 'A jar candle with a question mark' },
      { id: 7, name: 'Autumn Spice Delight', description:'test description test description test description test description test description test', imageUrl: 'https://picsum.photos/id/1066/300/300', price: 16.50, altText: 'An orange candle with autumn spices' },
      { id: 8, name: 'Lavender Bliss Candle', description:'test description', imageUrl: 'https://picsum.photos/id/1060/300/300', price: 15.99, altText: 'A calming lavender scented candle' },
    ]

    // Use `of` and `delay` to simulate a network request
    // In a real scenario, this would be an HttpClient call:
    // return this.http.get<Product[]>('/api/products/bestsellers');
    return of(mockCandlesCollection).pipe(delay(800)); // Simulate 800ms delay
  }

  // Rename method to reflect it fetches full details
  getProductDetails(productSlug: string): Observable<ProductDetailsData> {
    // --- Mock Data Simulation ---
    // In a real app: return this.http.get<ProductDetailsData>(`/api/products/${productSlug}`);

    let mockProductData: ProductDetailsData | null = null;

    // Example specific product
    if (productSlug === 'lavender-bliss-jar') {
      mockProductData = {
        id: 'prod_123',
        slug: 'lavender-bliss-jar',
        name: 'Lavender Bliss Jar Candle',
        description: 'Experience tranquility with our Lavender Bliss Jar Candle. Hand-poured using sustainable soy wax and infused with pure lavender essential oil, this candle provides hours of calming aroma. Perfect for relaxation and creating a peaceful atmosphere in any room.',
        price: 19.99,
        sku: 'LBJC-01',
        stockQuantity: 50,
        images: [
          { url: 'https://www.yourdomain.com/assets/images/lavender-candle-1.jpg', altText: 'Lavender Bliss Jar Candle front view' },
          { url: 'https://www.yourdomain.com/assets/images/lavender-candle-2.jpg', altText: 'Lavender Bliss Jar Candle burning' }
        ],
        category: {
          id: 'cat_01',
          name: 'Candles',
          slug: 'candles'
        },
        metadata: { // Nested metadata
          title: 'Lavender Bliss Jar Candle | Five A Crafts', // More specific title
          description: 'Shop the Lavender Bliss Jar Candle at Five A Crafts. Hand-poured, sustainable soy wax candle with calming lavender scent.', // SEO-focused description
          ogImageUrl: 'https://www.yourdomain.com/assets/og-image-lavender-candle.jpg',
          twitterImageUrl: 'https://www.yourdomain.com/assets/twitter-image-lavender-candle.jpg'
        }
      };
    } else if (productSlug === 'rustic-wooden-bowl') {
      // Add another mock product example
      mockProductData = {
        id: 'prod_456',
        slug: 'rustic-wooden-bowl',
        name: 'Rustic Wooden Bowl',
        description: 'Add a touch of natural charm to your home with this beautiful rustic wooden bowl. Hand-carved from sustainably sourced mango wood, each bowl features unique grain patterns. Ideal for serving salads, fruits, or as a decorative centerpiece.',
        price: 34.50,
        sku: 'RWB-01',
        stockQuantity: 25,
        images: [
          { url: 'https://www.yourdomain.com/assets/images/wooden-bowl-1.jpg', altText: 'Rustic Wooden Bowl top view' },
          { url: 'https://www.yourdomain.com/assets/images/wooden-bowl-2.jpg', altText: 'Rustic Wooden Bowl side view' }
        ],
        category: {
          id: 'cat_02',
          name: 'Home Decor',
          slug: 'home-decor'
        },
        metadata: {
          title: 'Rustic Wooden Bowl | Hand-Carved Decor | Five A Crafts',
          description: 'Discover our unique Rustic Wooden Bowl, hand-carved from sustainable mango wood. Perfect for serving or decoration. Shop now at Five A Crafts.',
          ogImageUrl: 'https://www.yourdomain.com/assets/og-image-wooden-bowl.jpg',
          twitterImageUrl: 'https://www.yourdomain.com/assets/twitter-image-wooden-bowl.jpg'
        }
      };
    }

    // Simulate API call result
    if (mockProductData) {
      return of(mockProductData).pipe(delay(800)); // Increase delay to see loading state
    } else {
      // Simulate a 'Not Found' scenario
      console.error(`Mock product data not found for slug: ${productSlug}`);
      return throwError(() => new Error('Product not found')); // Simulate HTTP 404
    }
  }
}

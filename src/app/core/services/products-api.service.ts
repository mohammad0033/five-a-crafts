import { Injectable } from '@angular/core';
import {delay, Observable, of, throwError} from 'rxjs';
import {Product} from '../models/product';
import {ProductDetailsData} from '../../features/product-details/models/product-details-data';
import {ReviewsData} from '../../features/product-details/models/reviews-data';
import {Review} from '../../features/product-details/models/review';

@Injectable({
  providedIn: 'root'
})
export class ProductsApiService {

  // Mock reviews database, keyed by productSlug for more realistic simulation
  private mockReviewsDb: { [productSlug: string]: Review[] } = {
    'lavender-bliss-jar': [ // Assuming 'lavender-bliss-jar' is a slug from your getProductDetails
      { id: 1, userName: 'Alice W.', rating: 5, date: 'October 1, 2023', comment: 'Absolutely blissful! The lavender scent is so calming. My new favorite.' },
      { id: 2, userName: 'Bob T.', rating: 4, date: 'October 5, 2023', comment: 'Very good candle, burns evenly. Scent is strong but not overpowering.' },
      { id: 3, userName: 'Charlie B.', rating: 5, date: 'October 10, 2023', comment: 'Perfect for unwinding after a long day. Highly recommend!' },
      { id: 4, userName: 'Diana P.', rating: 3, date: 'October 12, 2023', comment: 'It\'s a nice candle, but I expected the scent to last longer.' },
      { id: 5, userName: 'Edward S.', rating: 5, date: 'October 15, 2023', comment: 'Beautifully packaged and smells divine. Will buy again.' },
      { id: 6, userName: 'Fiona G.', rating: 4, date: 'October 18, 2023', comment: 'Good quality soy wax. The lavender is very authentic.' },
      { id: 7, userName: 'George J.', rating: 2, date: 'October 20, 2023', comment: 'Not what I expected. The scent was too faint for my liking.' },
      { id: 8, userName: 'Harry P.', rating: 5, date: 'October 22, 2023', comment: 'Magical! Makes my common room smell amazing.' },
      { id: 9, userName: 'Iris W.', rating: 4, date: 'October 25, 2023', comment: 'Works well for a medium-sized room. Pleasant aroma.' },
      { id: 10, userName: 'John D.', rating: 3, date: 'October 28, 2023', comment: 'Average product. Nothing too special but does the job.' },
      { id: 11, userName: 'Jane S.', rating: 5, date: 'November 1, 2023', comment: 'Fantastic! I use it during my yoga sessions.' },
    ],
    'rustic-wooden-bowl': [ // Example for another product
      { id: 101, userName: 'Woody W.', rating: 5, date: 'September 15, 2023', comment: 'Beautiful craftsmanship! Looks great on my coffee table.' },
      { id: 102, userName: 'Pocahontas', rating: 4, date: 'September 20, 2023', comment: 'Love the natural wood grain. A bit smaller than I thought but still lovely.' },
    ],
    // Add more mock reviews for other product slugs as needed
  };

  private allMockProducts: Product[] = [
    { id: 1, name: 'Lavender Bliss Candle', description:'A calming lavender scented candle.', imageUrl: 'https://picsum.photos/id/1060/300/300', price: 15.99, altText: 'A calming lavender scented candle' },
    { id: 2, name: 'Ocean Breeze Pillar', description:'A refreshing ocean breeze scented pillar candle.', imageUrl: 'https://picsum.photos/id/1061/300/300', price: 12.50, isFavorite: true, altText: 'A blue pillar candle' },
    { id: 3, name: 'Vanilla Dream Votive Set', description:'Sweet vanilla dream votive candle set.', imageUrl: 'https://picsum.photos/id/1062/300/300', price: 9.99, altText: 'Set of small vanilla votive candles' },
    { id: 4, name: 'Cozy Cabin Tealights', description:'Warm and cozy cabin scented tealights.', imageUrl: 'https://picsum.photos/id/1063/300/300', price: 5.49, altText: 'Pack of tealight candles' },
    { id: 5, name: 'Elegant Taper Candles (Pair)', description:'A pair of elegant taper candles for formal occasions.', imageUrl: 'https://picsum.photos/id/1064/300/300', price: 8.00, altText: 'Two tall taper candles' },
    { id: 6, name: 'Mystery Scent Jar', description:'A mysterious and intriguing scented jar candle.', imageUrl: 'https://picsum.photos/id/1065/300/300', price: 18.00, altText: 'A jar candle with a question mark' },
    { id: 7, name: 'Autumn Spice Delight', description:'A delightful autumn spice scented candle.', imageUrl: 'https://picsum.photos/id/1066/300/300', price: 16.50, altText: 'An orange candle with autumn spices' },
    { id: 8, name: 'Forest Pine Cones', description:'Decorative pine cones with a hint of forest scent.', imageUrl: 'https://picsum.photos/id/1067/300/300', price: 7.99, altText: 'A collection of forest pine cones' },
    { id: 9, name: 'Handcrafted Wooden Spoon', description:'A beautifully handcrafted wooden spoon for your kitchen.', imageUrl: 'https://picsum.photos/id/1068/300/300', price: 11.00, altText: 'Handcrafted wooden spoon' },
    { id: 10, name: 'Ceramic Mug Set', description:'Set of two artisanal ceramic mugs.', imageUrl: 'https://picsum.photos/id/1069/300/300', price: 22.50, altText: 'Two ceramic mugs' },
  ];

  constructor() { }

  /**
   * Simulates fetching best-selling products from an API.
   * Returns an Observable of Product array.
   */
  getBestSellingProducts(): Observable<Product[]> {
    const mockBestSellers: Product[] = this.allMockProducts.slice(0, 7); // Use a slice from the main list
    return of(mockBestSellers).pipe(delay(800));
  }

  getCandlesCollectionProducts(): Observable<Product[]> {
    // Filter products that are likely candles for this collection
    const mockCandlesCollection: Product[] = this.allMockProducts.filter(
      p => p.name.toLowerCase().includes('candle') || p.name.toLowerCase().includes('votive') || p.name.toLowerCase().includes('tealights')
    ).slice(0,8);
    return of(mockCandlesCollection).pipe(delay(800));
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
          { url: 'https://picsum.photos/id/1061/300/300', altText: 'Lavender Bliss Jar Candle front view' },
          { url: 'https://picsum.photos/id/1062/300/300', altText: 'Lavender Bliss Jar Candle burning' },
          { url: 'https://picsum.photos/id/1063/300/300', altText: 'Lavender Bliss Jar Candle side view' },
          { url: 'https://picsum.photos/id/1064/300/300', altText: 'Lavender Bliss Jar Candle candle holder' },
          { url: 'https://picsum.photos/id/1065/300/300', altText: 'Lavender Bliss Jar Candle candle holder' },
          { url: 'https://picsum.photos/id/1066/300/300', altText: 'Lavender Bliss Jar Candle candle holder' }
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
        },
        variations: [
          {
            "id": "color",
            "name": "Color",
            "options": [
              { "name": "White", "value": "white" },
              { "name": "Black", "value": "black" },
              { "name": "Off-white", "value": "offwhite" },
              { "name": "Gold", "value": "gold_color" }
            ]
            // selectedValue could be pre-filled by the backend or set to a default
          },
          {
            "id": "gold-paper",
            "name": "Gold Paper",
            "options": [
              { "name": "Silver", "value": "silver_paper" },
              { "name": "Gold", "value": "gold_paper" }
            ]
          },
          // ... and so on for other variation categories like "Stones"
        ]
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

  getProductReviews(productSlug: string): Observable<ReviewsData> {
    const reviewsForProduct = this.mockReviewsDb[productSlug] || [];

    // If a specific product slug was given but no reviews found, return an empty structure
    // This handles cases where a product might exist but have no reviews yet.
    if (reviewsForProduct.length === 0 && Object.keys(this.mockReviewsDb).includes(productSlug)) {
      const emptyReviewsData: ReviewsData = {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: [
          { stars: 5, count: 0 }, { stars: 4, count: 0 }, { stars: 3, count: 0 },
          { stars: 2, count: 0 }, { stars: 1, count: 0 },
        ],
        reviewsList: []
      };
      return of(emptyReviewsData).pipe(delay(300)); // Simulate slight delay
    }
    // If productSlug doesn't match any known product with reviews, return a default empty state
    if (reviewsForProduct.length === 0 && !Object.keys(this.mockReviewsDb).includes(productSlug)) {
      console.warn(`No mock reviews configured for slug: ${productSlug}. Returning default empty reviews data.`);
      const defaultEmptyReviewsData: ReviewsData = {
        totalReviews: 0, averageRating: 0,
        ratingDistribution: [
          { stars: 5, count: 0 }, { stars: 4, count: 0 }, { stars: 3, count: 0 },
          { stars: 2, count: 0 }, { stars: 1, count: 0 },
        ],
        reviewsList: []
      };
      return of(defaultEmptyReviewsData).pipe(delay(100));
    }


    const totalReviews = reviewsForProduct.length;
    let sumOfRatings = 0;
    const ratingDistributionMap = new Map<number, number>();

    // Initialize map for all star ratings (5 down to 1)
    for (let i = 5; i >= 1; i--) {
      ratingDistributionMap.set(i, 0);
    }

    reviewsForProduct.forEach(review => {
      sumOfRatings += review.rating;
      ratingDistributionMap.set(review.rating, (ratingDistributionMap.get(review.rating) || 0) + 1);
    });

    const averageRating = totalReviews > 0 ? sumOfRatings / totalReviews : 0;

    const ratingDistribution = Array.from(ratingDistributionMap.entries())
      .map(([stars, count]) => ({ stars, count }))
      .sort((a, b) => b.stars - a.stars); // Ensure sorted from 5 stars to 1 star

    const reviewsData: ReviewsData = {
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(1)), // Format to one decimal place
      ratingDistribution,
      reviewsList: reviewsForProduct // The full list of reviews
    };

    return of(reviewsData).pipe(delay(600)); // Simulate API delay
  }

  getProductsYouMayLike(_currentItemId?: string | number, _categorySlug?: string): Observable<Product[]> {
    // For a real app, this would involve more complex logic:
    // - Fetching products from the same category.
    // - Using a recommendation engine.
    // - Filtering out the currentItem.
    // For this mock, we'll just return a shuffled subset of allMockProducts, excluding a potential current item.

    let recommendations = [...this.allMockProducts];
    if (_currentItemId) {
      recommendations = recommendations.filter(p => p.id !== _currentItemId);
    }

    // Shuffle and take a few (e.g., 4 products)
    const shuffled = recommendations.sort(() => 0.5 - Math.random());
    const mockProductsYouMayLike = shuffled.slice(0, 4);

    return of(mockProductsYouMayLike).pipe(delay(700)); // Simulate API delay
  }

  getRecentlyViewedProducts(): Observable<Product[]> {
    // In a real application, recently viewed product IDs would be stored
    // in localStorage or a user-specific backend service.
    // Then, you'd fetch the details for those IDs.

    // For this mock, we'll return a static list of products.
    // Let's imagine the user recently viewed these:
    const mockRecentlyViewed: Product[] = [
      this.allMockProducts[2], // Vanilla Dream Votive Set
      this.allMockProducts[5], // Mystery Scent Jar
      this.allMockProducts[0], // Lavender Bliss Candle
      this.allMockProducts[8], // Handcrafted Wooden Spoon
    ].filter(p => p); // Filter out any undefined if IDs were bad

    // Ensure we don't return more than a certain number, e.g., 4
    return of(mockRecentlyViewed.slice(0, 4)).pipe(delay(400)); // Simulate API delay
  }
}

import { Injectable } from '@angular/core';
import {delay, Observable, of} from 'rxjs';
import {Product} from '../models/product';
import {ReviewsData} from '../../features/product-details/models/reviews-data';
import {Review} from '../../features/product-details/models/review';
import {HttpClient, HttpParams} from '@angular/common/http';
import {CommonApiResponse} from '../models/common-api-response';
import {Url} from '../constants/base-url';

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

  allMockProducts: Product[] = [];

  constructor(private http: HttpClient) { }

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
      p => p.title.toLowerCase().includes('candle') || p.title.toLowerCase().includes('votive') || p.title.toLowerCase().includes('tealights')
    ).slice(0,8);
    return of(mockCandlesCollection).pipe(delay(800));
  }

  getCategoryProducts(categoryId: string): Observable<CommonApiResponse> {
    let params = new HttpParams().set('category', categoryId);
    return this.http.get<CommonApiResponse>(`${Url.baseUrl}/api/oscar/products/`, { params: params });
  }

  // Rename method to reflect it fetches full details
  getProductDetails(productSlug: string): Observable<CommonApiResponse> {
    return this.http.get<CommonApiResponse>(`${Url.baseUrl}/api/oscar/products/${productSlug}`);
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

  getFavoriteProducts(): Observable<Product[]> {
    // return all products with isFavorite === true
    const mockFavoriteProducts: Product[] = this.allMockProducts.filter(p => p.in_wishlist);
    return of(mockFavoriteProducts).pipe(delay(300));
  }
}

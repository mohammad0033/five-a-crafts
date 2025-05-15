import { Injectable } from '@angular/core';
import {delay, Observable, of, tap} from 'rxjs';
import {UserInfo} from '../models/user-info';
import {Order} from '../models/order';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  // Mock Data
  private mockUserInfo: UserInfo = {
    name: 'Current User Name',
    company: 'User Company Inc.',
    address: '456 Park Ave',
    apartment: 'Suite 101',
    city: 'Metropolis',
    governorate: 'Region',
    phone: '555-0000',
    email: 'user@example.com'
  };

  private mockOrders: Order[] = [
    {
      orderNumber: 'ORD123',
      orderDate: '2023-10-26',
      total: 200.00, // Total should match sum of product prices * quantities
      status: 'delivered',
      shippingAddress: '123 Main St, Anytown, USA',
      paymentMethod: 'Credit Card',
      subtotal: 270.00, // Subtotal should match sum of product prices
      discount: 10.00,
      shippingCost: 30.00,
      totalCost: 200.00,
      deliveredOn: '2023-10-27',
      cancelledOn: '',
      products: [
        { id: 'prod-a', name: 'Handcrafted Wooden Bowl', description: 'Beautifully carved bowl', imageUrl: 'https://picsum.photos/id/1060/300/300', price: 50.00, quantity: 4, slug: 'wooden-bowl' }, // 4 pieces
        { id: 'prod-b', name: 'Artisan Ceramic Mug', description: 'Unique glazed mug', imageUrl: 'https://picsum.photos/id/1061/300/300', price: 30.00, quantity: 1, slug: 'ceramic-mug' }, // 0 pieces (example)
        { id: 'prod-c', name: 'Knitted Scarf', description: 'Soft wool scarf', imageUrl: 'https://picsum.photos/id/1062/300/300', price: 40.00, quantity: 1, slug: 'knitted-scarf' }, // 0 pieces (example)
      ]
    },
    {
      orderNumber: 'ORD456',
      orderDate: '2023-11-01',
      total: 60.50,
      status: 'pending',
      products: [
        { id: 'prod-b', name: 'Artisan Ceramic Mug', description: 'Unique glazed mug', imageUrl: 'https://picsum.photos/id/1061/300/300', price: 30.25, quantity: 2, slug: 'ceramic-mug' }, // 2 pieces
      ]
    },
    {
      orderNumber: 'ORD789',
      orderDate: '2023-11-05',
      total: 45.00,
      status: 'cancelled',
      products: [
        { id: 'prod-c', name: 'Knitted Scarf', description: 'Soft wool scarf', imageUrl: 'https://picsum.photos/id/1062/300/300', price: 45.00, quantity: 1, slug: 'knitted-scarf' },
      ]
    },
    {
      orderNumber: 'ORD101',
      orderDate: '2023-11-10',
      total: 100.00,
      status: 'delivered',
      products: [
        { id: 'prod-a', name: 'Handcrafted Wooden Bowl', description: 'Beautifully carved bowl', imageUrl: 'https://picsum.photos/id/1060/300/300', price: 50.00, quantity: 2, slug: 'wooden-bowl' }, // 2 pieces
      ]
    },
  ];

  constructor() { }

  /**
   * Simulates fetching user information.
   * @returns An Observable resolving with user info after a delay.
   */
  getUserInfo(): Observable<UserInfo> {
    console.log('ProfileService: Fetching user info...');
    // Use `of` to create an observable from the mock data
    // Use `delay` to simulate network latency
    // Use `tap` to log before returning
    return of(this.mockUserInfo).pipe(
      delay(1000), // Simulate 1 second delay
      tap(() => console.log('ProfileService: User info fetched.'))
      // Example of simulating an error:
      // return throwError(() => new Error('Failed to fetch user info')).pipe(delay(1000));
    );
  }

  /**
   * Simulates updating user information.
   * @param updatedInfo The new user information.
   * @returns An Observable resolving with the updated user info after a delay.
   */
  updateUserInfo(updatedInfo: UserInfo): Observable<UserInfo> {
    console.log('ProfileService: Saving user info...', updatedInfo);
    // In a real service, you'd make an HTTP PUT/POST request here.
    // For the mock, we'll update the local mock data and return it.
    this.mockUserInfo = { ...this.mockUserInfo, ...updatedInfo }; // Simple merge
    return of(this.mockUserInfo).pipe(
      delay(1500), // Simulate 1.5 second delay for saving
      tap(() => console.log('ProfileService: User info saved.', this.mockUserInfo))
      // Example of simulating a save error:
      // return throwError(() => new Error('Failed to save user info')).pipe(delay(1500));
    );
  }

  /**
   * Simulates fetching user orders.
   * @returns An Observable resolving with a list of orders after a delay.
   */
  getUserOrders(): Observable<Order[]> {
    console.log('ProfileService: Fetching user orders...');
    // To simulate the "no orders" state, you could return of([]).pipe(delay(1500));
    return of(this.mockOrders).pipe(
      delay(1500), // Simulate 1.5 second delay
      tap(() => console.log('ProfileService: User orders fetched.'))
      // Example of simulating an error:
      // return throwError(() => new Error('Failed to fetch orders')).pipe(delay(1500));
    );
  }

  /**
   * Simulates fetching details for a single order by its order number (slug).
   * @param orderSlug The order number to fetch.
   * @returns An Observable resolving with the Order details, or null if not found.
   */
  getOrderDetailBySlug(orderSlug: string): Observable<Order | null> {
    console.log(`ProfileService: Fetching order details for slug: ${orderSlug}...`);
    const order = this.mockOrders.find(o => o.orderNumber === orderSlug);

    // Simulate network delay
    return of(order ?? null).pipe(
      delay(1000),
      tap(foundOrder => {
        if (foundOrder) {
          console.log(`ProfileService: Order details fetched for ${orderSlug}.`);
        } else {
          console.warn(`ProfileService: Order with slug ${orderSlug} not found.`);
        }
      }),
      // Example of simulating an error:
      // catchError(error => {
      //   console.error(`ProfileService: Error fetching order ${orderSlug}`, error);
      //   return throwError(() => new Error(`Failed to fetch order ${orderSlug}`));
      // })
    );
  }
}

import { Injectable } from '@angular/core';
import {BehaviorSubject, catchError, delay, map, Observable, of, tap, throwError} from 'rxjs';
import {UserInfo} from '../models/user-info';
import {Order} from '../models/order';
import {HttpClient} from '@angular/common/http';
import {Url} from '../../../core/constants/base-url';
import {AuthService} from '../../../core/services/auth.service';
import {UserAddress} from '../models/user-address';
import {CommonApiResponse} from '../../../core/models/common-api-response';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private userInfoSubject = new BehaviorSubject<UserInfo | null>(null);
  public userInfo$: Observable<UserInfo | null> = this.userInfoSubject.asObservable();

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

  // --- NEW MOCK ADDRESS DATA ---
  private mockUserAddresses: UserAddress[] = [
    {
      id: 'addr_home_123',
      title: 'Home Address',
      details: '123 Sunshine Avenue, Apt 4B, Springfield, IL 62704, USA',
      isDefault: true
    },
    {
      id: 'addr_work_456',
      title: 'Work Address',
      details: '456 Corporate Plaza, Suite 700, Metropolis, IL 60601, USA',
      isDefault: false
    }
  ];
  // --- END NEW MOCK ADDRESS DATA ---

  constructor(private http: HttpClient,
              private authService: AuthService) { }

  /**
   * Fetches the current user's profile information from the backend.
   * @returns An Observable of UserInfo.
   */
  getUserInfo(): Observable<UserInfo | null> { // Added this method
    const headers = this.authService.getAuthHeaders()
    // Replace with your actual API endpoint for fetching user profile
    return this.http.get<any>(`${Url.baseUrl}/api/user/properties/` , { headers }).pipe(
      map(response => {
        if (response && response.status && response.data) {
          return response.data;
        }
        // If status is false or data is missing, but the request itself didn't fail http-wise
        console.warn('ProfileService: getUserInfo API call successful but data not as expected.', response);
        return null; // Or throw an error if this case should be treated as a failure
      }),
      catchError(error => {
        console.error('ProfileService: Error fetching user info via API', error);
        // It's often better for the resolver to get a null than to fail the entire navigation,
        // unless user info is absolutely critical for the route to function.
        return of(null);
      })
    );
  }

  /**
   * Loads the initial user information into the BehaviorSubject.
   * This is typically called once when the profile section is loaded,
   * often with data from a route resolver.
   * @param userInfo The initial user information.
   */
  loadInitialUserInfo(userInfo: UserInfo[] | null): void {
    if (!userInfo || userInfo.length === 0) {
      this.userInfoSubject.next(null);
      return;
    }
    this.userInfoSubject.next(userInfo[0]);
  }

  /**
   * Updates the shared user information state.
   * This should be called after a successful API update.
   * @param updatedUserInfo The new user information.
   */
  private updateSharedUserInfo(updatedUserInfo: UserInfo): void {
    this.userInfoSubject.next(updatedUserInfo);
  }

  /**
   * Gets the current value of UserInfo from the BehaviorSubject.
   * Useful for components that need a snapshot and aren't subscribing.
   */
  getCurrentUserInfo(): UserInfo | null {
    return this.userInfoSubject.getValue();
  }

  /**
   * Makes an API call to update user information on the backend.
   * On success, it updates the shared UserInfo state.
   * @param userData The user data to update.
   */
  updateUserInfo(userData: Partial<UserInfo>): Observable<UserInfo> {
    const headers = this.authService.getAuthHeaders()
    return this.http.patch<any>(`${Url.baseUrl}/api/user/properties/0/`, userData, { headers } ).pipe( // Changed to CommonApiResponse<UserInfo>
      map(response => {
        if (response && response.status && response.data) {
          this.updateSharedUserInfo(response.data);
          return response.data;
        }
        throw new Error(response?.message || 'Failed to update user info or API response format incorrect.');
      }),
      catchError(error => {
        console.error('Error updating user info via API:', error);
        return throwError(() => new Error(error.error?.message || error.message || 'API error during user info update.'));
      })
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

  // --- NEW ADDRESS METHODS ---
  /**
   * Simulates fetching user addresses.
   * @returns An Observable resolving with a list of user addresses.
   */
  getUserAddresses(): Observable<UserAddress[]> {
    let headers = this.authService.getAuthHeaders()
    return this.http.get<CommonApiResponse>(`${Url.baseUrl}/api/oscar/useraddresses/`, { headers }).pipe(
      map((response:CommonApiResponse) => {
        console.log('ProfileService: Received user addresses response:', response);
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        } else {
          console.error('ProfileService: Invalid response data format');
          return [];
        }
      })
    )
  }

  /**
   * Simulates adding a new user address.
   * @param addressData The data for the new address.
   * @returns An Observable resolving with the newly added address (including an ID).
   */
  addUserAddress(addressData: Omit<UserAddress, 'id'>): Observable<UserAddress> {
    console.log('ProfileService: Adding new address...', addressData);
    const newAddress: UserAddress = {
      ...addressData,
      id: `addr_${Date.now()}` // Simple unique ID generation for mock
    };
    this.mockUserAddresses.push(newAddress);
    // In a real app, you'd likely want to update a BehaviorSubject here
    // and return the response from the server.
    return of(newAddress).pipe(delay(300));
  }

  /**
   * Simulates updating an existing user address.
   * @param addressId The ID of the address to update.
   * @param updatedData The new data for the address.
   * @returns An Observable resolving with the updated address.
   */
  updateUserAddress(addressId: string, updatedData: Partial<UserAddress>): Observable<UserAddress | null> {
    console.log(`ProfileService: Updating address ${addressId}...`, updatedData);
    const addressIndex = this.mockUserAddresses.findIndex(addr => addr.id === addressId);
    if (addressIndex > -1) {
      this.mockUserAddresses[addressIndex] = { ...this.mockUserAddresses[addressIndex], ...updatedData };
      // In a real app, update BehaviorSubject.
      return of({...this.mockUserAddresses[addressIndex]}).pipe(delay(300));
    }
    return of(null).pipe(delay(300)); // Address not found
  }

  /**
   * Simulates deleting a user address.
   * @param addressId The ID of the address to delete.
   * @returns An Observable resolving with a boolean indicating success.
   */
  deleteUserAddress(addressId: string): Observable<boolean> {
    console.log(`ProfileService: Deleting address ${addressId}...`);
    const initialLength = this.mockUserAddresses.length;
    this.mockUserAddresses = this.mockUserAddresses.filter(addr => addr.id !== addressId);
    // In a real app, update BehaviorSubject.
    const success = this.mockUserAddresses.length < initialLength;
    return of(success).pipe(delay(300));
  }
  // --- END NEW ADDRESS METHODS ---
}

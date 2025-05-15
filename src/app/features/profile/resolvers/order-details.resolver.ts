// C:/Ongoing projects/five-a-crafts/src/app/features/profile/resolvers/order-details.resolver.ts
import { ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ProfileService } from '../services/profile.service';
import {Order} from '../models/order'; // Adjust path

export const orderDetailsResolver: ResolveFn<Order | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<Order | null> => {
  const profileService = inject(ProfileService);
  const router = inject(Router); // Inject Router to handle not found case
  const orderSlug = route.paramMap.get('orderSlug');

  if (!orderSlug) {
    console.error('OrderDetailsResolver: No order slug provided in route.');
    // Redirect or handle error appropriately, e.g., navigate to a not-found page
    router.navigate(['/not-found']); // Example: Navigate to a not-found route
    return of(null); // Return null to prevent component activation
  }

  console.log(`OrderDetailsResolver: Resolving order details for slug: ${orderSlug}...`);

  return profileService.getOrderDetailBySlug(orderSlug).pipe(
    tap(order => {
      if (!order) {
        console.warn(`OrderDetailsResolver: Order with slug ${orderSlug} not found.`);
        // Redirect or handle not found, e.g., navigate to a not-found page
        router.navigate(['/not-found']); // Example: Navigate to a not-found route
      }
    }),
    catchError(error => {
      console.error(`OrderDetailsResolver: Error fetching order ${orderSlug}`, error);
      // Handle error, e.g., navigate to an error page or show a message
      // router.navigate(['/error']); // Example: Navigate to an error route
      return of(null); // Return null to prevent component activation on error
    })
  );
};

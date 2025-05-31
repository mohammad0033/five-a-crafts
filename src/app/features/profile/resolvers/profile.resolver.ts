// C:/Ongoing projects/five-a-crafts/src/app/features/profile/resolvers/profile.resolver.ts
import { ResolveFn } from '@angular/router';
import {ProfileService} from '../services/profile.service';
import {UserInfo} from '../models/user-info';
import {Order} from '../models/order';
import {inject} from '@angular/core';
import {catchError, forkJoin, of, tap} from 'rxjs'; // Add finalize

export interface ProfileResolvedData {
  userInfo: UserInfo | null;
  orders: Order[] | null;
}

export const profileResolver: ResolveFn<ProfileResolvedData> = (route, state) => {
  const profileService = inject(ProfileService);

  return forkJoin({
    userInfo: profileService.getUserInfo().pipe(
      catchError(error => {
        console.error('[DEBUG] ProfileResolver: Error fetching user info', error);
        return of(null);
      })
    ),
    orders: profileService.getUserOrders().pipe(
      catchError(error => {
        console.error('[DEBUG] ProfileResolver: Error fetching user orders', error);
        return of(null);
      })
    )
  }).pipe(
    tap(data => console.log('[DEBUG] ProfileResolver: Data resolved by forkJoin', data)),
    catchError(error => {
      console.error('[DEBUG] ProfileResolver: Error in forkJoin itself', error);
      return of({ userInfo: null, orders: null });
    })
  );
};

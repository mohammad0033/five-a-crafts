import { ResolveFn } from '@angular/router';
import {ProfileService} from '../services/profile.service';
import {UserInfo} from '../models/user-info';
import {Order} from '../models/order';
import {inject} from '@angular/core';
import {catchError, forkJoin, of, tap} from 'rxjs';

// Define an interface for the data your resolver will provide
export interface ProfileResolvedData {
  userInfo: UserInfo | null;
  orders: Order[] | null;
}

export const profileResolver: ResolveFn<ProfileResolvedData> = (route, state) => {
  const profileService = inject(ProfileService);
  console.log('ProfileResolver: Resolving profile data...');

  return forkJoin({
    userInfo: profileService.getUserInfo().pipe(
      catchError(error => {
        console.error('ProfileResolver: Error fetching user info', error);
        return of(null); // Return null or a default UserInfo object on error
      })
    ),
    orders: profileService.getUserOrders().pipe(
      catchError(error => {
        console.error('ProfileResolver: Error fetching user orders', error);
        return of(null); // Return null or an empty array on error
      })
    )
  }).pipe(
    tap(data => console.log('ProfileResolver: Resolved data', data)),
    catchError(error => {
      // This catchError is for forkJoin itself, though individual catches are usually sufficient
      console.error('ProfileResolver: Error in forkJoin', error);
      return of({ userInfo: null, orders: null });
    })
  );
};

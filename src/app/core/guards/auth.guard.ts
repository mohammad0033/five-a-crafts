import {CanActivateFn, Router, UrlTree} from '@angular/router';
import {map, Observable} from 'rxjs';
import {inject} from '@angular/core';
import {AuthService} from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state):
  Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {

  const authService = inject(AuthService);
  const router = inject(Router);

  // Example: If your AuthService has an observable for authentication state
  if (authService.isAuthenticated$) { // Check if isAuthenticated$ exists
    return authService.isAuthenticated$.pipe(
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        } else {
          // Redirect to login page
          return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
        }
      })
    );
  } else if (typeof authService.isAuthenticated === 'function') { // Check if isAuthenticated is a function
    // Example: If your AuthService has a synchronous method
    if (authService.isAuthenticated()) {
      return true;
    } else {
      // Redirect to login page
      return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }
  } else {
    // Fallback or error handling if AuthService structure is unexpected
    console.error('AuthService does not have a recognized authentication method.');
    return router.createUrlTree(['/login']); // Default redirect
  }
};

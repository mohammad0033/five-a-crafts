import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state): Promise<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // console.log(`AuthGuard: Running for URL "${state.url}". Current synchronous auth state: ${authService.isAuthenticated()}`);
  const isAuthenticated = await firstValueFrom(authService.isAuthenticated$);
  // console.log(`AuthGuard: Resolved isAuthenticated for "${state.url}" to: ${isAuthenticated}`);

  if (isAuthenticated === null) {
    // If authentication state is still being determined, redirect to the loading page.
    // Prevent a redirect loop if somehow /loading itself was guarded and triggered this.
    if (state.url.startsWith('/loading')) {
      // console.log(`AuthGuard: Auth state is null, but already navigating to "/loading". Allowing.`);
      return true;
    }
    // console.log(`AuthGuard: Auth state is null for "${state.url}". Redirecting to "/loading".`);
    return router.createUrlTree(['/loading'], { queryParams: { returnUrl: state.url } });
  }

  if (isAuthenticated) {
    // console.log(`AuthGuard: User is authenticated for "${state.url}". Allowing access.`);
    return true;
  }

  // At this point, isAuthenticated is false.
  const requiresAuth = route.data?.['requiresAuth'] as boolean | undefined;

  if (requiresAuth === true) {
    // User is not authenticated, and the route requires authentication.
    // console.log(`AuthGuard: User not authenticated for protected route "${state.url}". Redirecting to "/".`);
    return router.createUrlTree(['/'], { queryParams: { returnUrl: state.url } });
  }

  // User is not authenticated, but the route does not require authentication (e.g., public home page).
  // console.log(`AuthGuard: User not authenticated, but route "${state.url}" is public. Allowing access.`);
  return true;
};

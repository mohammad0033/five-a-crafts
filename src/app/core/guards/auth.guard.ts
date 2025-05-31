import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state): Promise<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const isAuthenticated = await firstValueFrom(authService.isAuthenticated$);

  if (isAuthenticated) {
    return true;
  } else {
    return router.createUrlTree(['/'], { queryParams: { returnUrl: state.url } });
  }
};

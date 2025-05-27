import { Injectable, inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {AuthApiService} from './auth-api.service';
import {User} from '../../features/auth/models/user';
import {LoginCredentials} from '../../features/auth/models/login-credentials';
import {RegisterPayload} from '../../features/auth/models/register-payload';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authApiService = inject(AuthApiService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone); // For running navigation inside Angular's zone

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    // @Inject(REQUEST) private request?: any // Optional: For Express, if you need to inspect cookies on server
  ) {
    // Attempt to load initial auth state when the service is instantiated
    // This is crucial for SSR and for when the app loads in the browser
    this.checkInitialAuthenticationState().subscribe();
  }

  private updateAuthState(user: User | null): void {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(!!user);
  }

  /**
   * Checks the initial authentication state.
   * On the server, this might be less relevant if pages are protected server-side first.
   * On the client, this calls the backend to verify the session cookie.
   */
  checkInitialAuthenticationState(): Observable<User | null> {
    if (isPlatformBrowser(this.platformId)) {
      return this.authApiService.checkStatus().pipe(
        tap(user => this.updateAuthState(user)),
        catchError(() => {
          this.updateAuthState(null);
          return of(null); // User is not authenticated
        })
      );
    } else if (isPlatformServer(this.platformId)) {
      // On the server, the auth state for the initial render is typically determined
      // by the backend framework handling the SSR request and its session/cookie management.
      // If you had a way to pass initial user data from server to client (e.g., via TransferState),
      // you could use it here. For now, we assume the client-side checkStatus is primary
      // after hydration.
      // If `this.request` (from @nguniversal/express-engine) was injected, you could potentially
      // inspect `this.request.cookies` here, but it's often simpler to let the client
      // `checkStatus()` after hydration.
      return of(null); // Default to not authenticated on server for this service's state
    }
    return of(null);
  }


  login(credentials: LoginCredentials): Observable<User> {
    return this.authApiService.login(credentials).pipe(
      map(response => {
        if (response.success && response.user) {
          this.updateAuthState(response.user);
          return response.user;
        }
        throw new Error(response.message || 'Login failed');
      }),
      catchError(error => {
        this.updateAuthState(null);
        return throwError(() => error);
      })
    );
  }

  register(payload: RegisterPayload): Observable<User> {
    return this.authApiService.register(payload).pipe(
      map(response => {
        if (response.success && response.user) {
          // Optionally auto-login the user by updating auth state
          this.updateAuthState(response.user);
          return response.user;
        }
        throw new Error(response.message || 'Registration failed');
      }),
      catchError(error => {
        this.updateAuthState(null);
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<void> {
    return this.authApiService.logout().pipe(
      tap(() => {
        this.performLogoutCleanup();
      }),
      catchError(error => {
        // Even if backend logout fails, clear client state
        this.performLogoutCleanup();
        return throwError(() => error); // Or handle more gracefully
      }),
      map(() => undefined) // Ensure it returns Observable<void>
    );
  }

  private performLogoutCleanup(): void {
    this.updateAuthState(null);
    // Important to run navigation inside Angular's zone
    this.ngZone.run(() => {
      this.router.navigate(['/login']);
    });
  }

  // Synchronous check, useful for guards if the state is already known
  public isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}

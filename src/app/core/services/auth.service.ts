import {Injectable, inject, PLATFORM_ID, NgZone, makeStateKey, TransferState} from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {AuthApiService} from './auth-api.service';
import {User} from '../../features/auth/models/user';
import {LoginCredentials} from '../../features/auth/models/login-credentials';
import {RegisterPayload} from '../../features/auth/models/register-payload';

// Define a key for storing the user in TransferState
const USER_STATE_KEY = makeStateKey<User | null>('currentUser');

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authApiService = inject(AuthApiService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone); // For running navigation inside Angular's zone
  private transferState = inject(TransferState);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Initialize authentication state based on the platform
    this.initializeAuthState();
  }

  private updateAuthState(user: User | null): void {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(!!user);
  }

  private initializeAuthState(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Client-side:
      // 1. Try to get user from TransferState (if SSR'd with an authenticated user)
      const userFromState = this.transferState.get(USER_STATE_KEY, null);
      if (userFromState) {
        this.updateAuthState(userFromState);
        this.transferState.remove(USER_STATE_KEY); // Clean up state after use
        return; // User state initialized from TransferState
      }

      // 2. If not in TransferState, check status via API (browser will send cookie)
      // This handles cases like direct client navigation or if SSR rendered logged-out state.
      this.authApiService.checkStatus().pipe(
        tap(user => this.updateAuthState(user)),
        catchError(() => {
          this.updateAuthState(null);
          return of(null); // User is not authenticated
        })
      ).subscribe();

    } else if (isPlatformServer(this.platformId)) {
      // Server-side:
      // The user state should ideally be determined by your server integration layer
      // (e.g., in server.ts by inspecting the request cookie) and placed into TransferState *before*
      // this service is instantiated or this method is called.
      const userFromState = this.transferState.get(USER_STATE_KEY, null);
      if (userFromState) {
        // If user was already put into TransferState by server-side pre-processing
        this.updateAuthState(userFromState);
      } else {
        // If not pre-filled by server logic, the server renders as logged out.
        // We generally AVOID making new blocking HTTP calls from AuthService constructor/init
        // on the server to an external API for auth status due to performance.
        this.updateAuthState(null);
      }
    }
  }

  /**
   * Explicitly checks authentication status, primarily for client-side use after initial load
   * or if needing to re-verify.
   */
  checkCurrentServerOrApiStatus(): Observable<User | null> {
    if (isPlatformBrowser(this.platformId)) {
      return this.authApiService.checkStatus().pipe(
        tap(user => this.updateAuthState(user)),
        catchError(() => {
          this.updateAuthState(null);
          return of(null);
        })
      );
    } else if (isPlatformServer(this.platformId)) {
      // On the server, the initial state is set by `initializeAuthState` via TransferState.
      // This method, if called on server, would reflect that already determined state.
      return of(this.currentUserSubject.value);
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

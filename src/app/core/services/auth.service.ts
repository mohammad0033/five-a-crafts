import {Injectable, inject, PLATFORM_ID, NgZone} from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {AuthApiService} from './auth-api.service';
import {User} from '../../features/auth/models/user';
import {LoginCredentials} from '../../features/auth/models/login-credentials';
import {RegisterPayload} from '../../features/auth/models/register-payload';
import {AuthResponse} from '../../features/auth/models/auth-response';
import {AuthData} from '../../features/auth/models/auth-data';

// Define a key for storing the user in TransferState
// const USER_STATE_KEY = makeStateKey<User | null>('currentUser');

// localStorage keys
const ACCESS_TOKEN_KEY = 'five_a_crafts_access_token';
const REFRESH_TOKEN_KEY = 'five_a_crafts_refresh_token';
// const TOKEN_EXPIRY_KEY = 'five_a_crafts_token_expiry';
const USER_DATA_KEY = 'five_a_crafts_user_data'; // To store user object
const CLIENT_SESSION_EXPIRY_KEY = 'five_a_crafts_client_session_expiry'; // For the 30-day client-side cleanup rule

// Client-side session expiry duration (30 days)
const CLIENT_STORAGE_EXPIRY_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authApiService = inject(AuthApiService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone); // For running navigation inside Angular's zone
  // private transferState = inject(TransferState);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {}

  private updateAuthState(user: User | null, isAuthenticated: boolean): void {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(isAuthenticated);
    if (isPlatformBrowser(this.platformId)) {
      if (user && isAuthenticated) { // Only save user if authenticated
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_DATA_KEY);
      }
    }
  }

  // cookie auth state
  // private initializeAuthState(): void {
  //   if (isPlatformBrowser(this.platformId)) {
  //     // Client-side:
  //     // 1. Try to get user from TransferState (if SSR'd with an authenticated user)
  //     const userFromState = this.transferState.get(USER_STATE_KEY, null);
  //     if (userFromState) {
  //       this.updateAuthState(userFromState);
  //       this.transferState.remove(USER_STATE_KEY); // Clean up state after use
  //       return; // User state initialized from TransferState
  //     }
  //
  //     // 2. If not in TransferState, check status via API (browser will send cookie)
  //     // This handles cases like direct client navigation or if SSR rendered logged-out state.
  //     this.authApiService.checkStatus().pipe(
  //       tap(user => this.updateAuthState(user)),
  //       catchError(() => {
  //         this.updateAuthState(null);
  //         return of(null); // User is not authenticated
  //       })
  //     ).subscribe();
  //
  //   } else if (isPlatformServer(this.platformId)) {
  //     // Server-side:
  //     // The user state should ideally be determined by your server integration layer
  //     // (e.g., in server.ts by inspecting the request cookie) and placed into TransferState *before*
  //     // this service is instantiated or this method is called.
  //     const userFromState = this.transferState.get(USER_STATE_KEY, null);
  //     if (userFromState) {
  //       // If user was already put into TransferState by server-side pre-processing
  //       this.updateAuthState(userFromState);
  //     } else {
  //       // If not pre-filled by server logic, the server renders as logged out.
  //       // We generally AVOID making new blocking HTTP calls from AuthService constructor/init
  //       // on the server to an external API for auth status due to performance.
  //       this.updateAuthState(null);
  //     }
  //   }
  // }

  /**
   * Initializes the authentication state.
   * Checks for a locally stored token, its client-side expiry,
   * and then validates with the server if necessary.
   * Returns an Observable that completes once initialization is done.
   * This method is intended to be called via APP_INITIALIZER.
   */
  public initializeAuthState(): Observable<void> {
    if (isPlatformBrowser(this.platformId)) {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

      if (this.isClientSessionExpired()) {
        // Client-side 30-day expiry policy met.
        if (accessToken) { // Log if there was a token that's now considered expired by client policy
          console.log('Client session expired as per 30-day policy during app initialization. Clearing auth state.');
        }
        this.performLogoutCleanup(false); // Clear auth data, don't navigate yet
        return of(undefined);
      }

      if (accessToken) {
        // Token exists and client session is not expired by the 30-day rule.
        // Try to load user data from local storage.
        const storedUser = localStorage.getItem(USER_DATA_KEY);
        let user: User | null = null;
        if (storedUser) {
          try {
            user = JSON.parse(storedUser);
          } catch (e) {
            console.error("Error parsing stored user data during init", e);
            localStorage.removeItem(USER_DATA_KEY); // Clear corrupted data
          }
        }

        if (user) {
          // User data found in local storage, assume authenticated for now.
          // A more robust check might still ping getProfile if token_actual_expiry is near.
          this.updateAuthState(user, true);
          return of(undefined); // Auth state determined synchronously
        } else {
          // Token exists, client session not expired, but no user data. Fetch profile.
          // This also validates the token with the server.
          return this.authApiService.getProfile().pipe(
            tap(profileUser => this.updateAuthState(profileUser, true)),
            catchError(() => {
              // Token might be invalid/expired on server, or other API error
              console.warn('Failed to get profile during init, token might be invalid. Clearing auth state.');
              this.performLogoutCleanup(false); // Clear local token and user
              return of(undefined); // Still resolve, app can continue as logged out
            }),
            map(() => undefined) // Ensure the observable chain completes with void
          );
        }
      } else {
        // No access token found.
        this.updateAuthState(null, false);
        return of(undefined); // Auth state determined synchronously (logged out)
      }
    } else if (isPlatformServer(this.platformId)) {
      // Server-side: Tokens are not available from localStorage.
      // Render as logged out. Client will initialize auth state via APP_INITIALIZER.
      this.updateAuthState(null, false);
      return of(undefined);
    }
    // Fallback, should ideally not be reached if platform is always browser or server
    this.updateAuthState(null, false);
    return of(undefined);
  }

  /**
   * Checks if the client-side stored session has exceeded the 30-day limit.
   */
  private isClientSessionExpired(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false; // This check is only relevant on the browser
    }

    const expiryString = localStorage.getItem(CLIENT_SESSION_EXPIRY_KEY);

    if (!expiryString) {
      // If there's no client-defined expiry timestamp (e.g., older session before this feature),
      // this specific 30-day rule does not apply to it.
      // The token might still be invalid for other reasons (e.g., revoked by server, actual token expiry).
      return false;
    }

    const expiryTime = parseInt(expiryString, 10);

    if (isNaN(expiryTime)) {
      // Invalid or corrupted expiry data.
      console.warn('Corrupted client session expiry data found. Treating as expired for cleanup.');
      localStorage.removeItem(CLIENT_SESSION_EXPIRY_KEY); // Clean up corrupted item
      return true; // Consider it expired to force a logout/cleanup for this inconsistent state.
    }

    return Date.now() > expiryTime;
  }

  /**
   * Explicitly checks authentication status, primarily for client-side use after initial load
   * or if needing to re-verify.
   */
  // checkCurrentServerOrApiStatus(): Observable<User | null> {
  //   if (isPlatformBrowser(this.platformId)) {
  //     return this.authApiService.checkStatus().pipe(
  //       tap(user => this.updateAuthState(user)),
  //       catchError(() => {
  //         this.updateAuthState(null);
  //         return of(null);
  //       })
  //     );
  //   } else if (isPlatformServer(this.platformId)) {
  //     // On the server, the initial state is set by `initializeAuthState` via TransferState.
  //     // This method, if called on server, would reflect that already determined state.
  //     return of(this.currentUserSubject.value);
  //   }
  //   return of(null);
  // }

  // --- Token Management ---
  private saveAuthData(authData: AuthData): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(ACCESS_TOKEN_KEY, authData.access);
      if (authData.refresh) {
        localStorage.setItem(REFRESH_TOKEN_KEY, authData.refresh);
      } else {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }

      // Store backend-provided access token expiry if available and needed for other logic (e.g. proactive refresh)
      // if (authData.expiry) {
      //   localStorage.setItem(TOKEN_EXPIRY_KEY, JSON.stringify(authData.expiry));
      // } else {
      //   localStorage.removeItem(TOKEN_EXPIRY_KEY);
      // }

      if (authData.user) {
        // User data will be set by updateAuthState after successful login/register
        // localStorage.setItem(USER_DATA_KEY, JSON.stringify(authData.user));
      }

      // Set our client-side session expiry for the 30-day rule
      const clientExpiryTime = Date.now() + CLIENT_STORAGE_EXPIRY_DURATION_MS;
      localStorage.setItem(CLIENT_SESSION_EXPIRY_KEY, clientExpiryTime.toString());
      console.log(`Client session expiry set to: ${new Date(clientExpiryTime).toISOString()}`);
    }
  }

  public getAccessToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      // Check for client-side 30-day session expiry first
      if (this.isClientSessionExpired()) {
        console.log('Access token requested, but client session has expired (30-day policy). Clearing auth data.');
        this.performLogoutCleanup(false); // Clear data, don't navigate from here
        return null;
      }
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return null;
  }

  public getRefreshToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      // Optionally, also check client session expiry for refresh token access
      // if (this.isClientSessionExpired()) {
      //   this.performLogoutCleanup(false);
      //   return null;
      // }
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  }

  private clearAuthData(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      // localStorage.removeItem(TOKEN_EXPIRY_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      localStorage.removeItem(CLIENT_SESSION_EXPIRY_KEY); // Clear our client session expiry
      console.log('All client auth data cleared.');
    }
  }

  // --- Authentication Methods ---
  login(credentials: LoginCredentials): Observable<User | null> {
    return this.authApiService.login(credentials).pipe(
      map((response: AuthResponse) => {
        if (response.status && response.data && response.data.access) { // Ensure access token is present
          this.saveAuthData(response.data);
          this.updateAuthState(response.data.user || null, true);
          return response.data.user || null;
        }
        // Use message from response if available, otherwise a generic one
        const errorMessage = response.message || 'Login failed: Invalid response from server.';
        throw new Error(errorMessage);
      }),
      catchError(error => {
        this.performLogoutCleanup(false); // Clear any partial state, don't navigate
        // error.message might already be set if thrown from map
        const errorMessage = error.message || 'An unknown error occurred during login.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  register(payload: RegisterPayload): Observable<User | null> {
    return this.authApiService.register(payload).pipe(
      map((response: AuthResponse) => {
        if (response.status && response.data && response.data.access) { // Ensure access token is present
          // Assuming registration also logs the user in and returns tokens
          this.saveAuthData(response.data);
          this.updateAuthState(response.data.user || null, true);
          return response.data.user || null;
        }
        const errorMessage = response.message || 'Registration failed: Invalid response from server.';
        throw new Error(errorMessage);
      }),
      catchError(error => {
        this.performLogoutCleanup(false); // Clear any partial state, don't navigate
        const errorMessage = error.message || 'An unknown error occurred during registration.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout(navigateToLogin: boolean = true): Observable<void> {
    return this.authApiService.logout().pipe(
      tap(() => {
        this.performLogoutCleanup(navigateToLogin);
      }),
      catchError(error => {
        console.warn('Backend logout failed, clearing client state anyway.', error);
        this.performLogoutCleanup(navigateToLogin);
        return of(undefined); // Complete the observable chain successfully even if backend fails
      }),
      map(() => undefined) // Ensure it emits void
    );
  }

  private performLogoutCleanup(navigate: boolean = true): void {
    this.clearAuthData();
    this.updateAuthState(null, false); // This will also clear USER_DATA_KEY from localStorage
    if (navigate && isPlatformBrowser(this.platformId)) {
      this.ngZone.run(() => {
        this.router.navigate(['/login']);
      });
    }
  }

  // Synchronous check, useful for guards
  public isAuthenticatedSync(): boolean {
    // Consider checking token expiry here if you store and parse it
    return this.isAuthenticatedSubject.value;
  }

  // Synchronous check, useful for guards if the state is already known
  public isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}

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
import {HttpHeaders} from '@angular/common/http';
import {SuccessRegister} from '../../features/auth/models/success-register';

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

  private isAuthenticatedSubject = new BehaviorSubject<boolean | null>(null);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {}

  private updateAuthState(user: User | null, isAuthenticated: boolean): void {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(isAuthenticated);
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
    // isAuthenticatedSubject is already null by default from its BehaviorSubject initialization.

    if (isPlatformBrowser(this.platformId)) {
      // Use setTimeout to schedule a macrotask.
      // This gives more time for the initial null state to be observed by guards
      // before the actual auth state is determined from localStorage.
      setTimeout(() => {
        this.ngZone.run(() => { // Ensure updates run within Angular's zone
          console.log('AuthService: setTimeout callback executing - checking auth state.');
          const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
          if (this.isClientSessionExpired()) {
            this.performLogoutCleanup(false); // Sets isAuthenticatedSubject to false
          } else if (accessToken) {
            // User is authenticated based on token presence.
            // currentUserSubject will be null initially. It gets populated upon login/registration
            // or if you implement a separate fetch for user details.
            this.updateAuthState(null, true);
          } else {
            this.updateAuthState(null, false); // Sets isAuthenticatedSubject to false
          }
        });
      }, 0); // A timeout of 0 ms still defers it to the macrotask queue
    } else if (isPlatformServer(this.platformId)) {
      // For SSR, auth state is typically determined synchronously or passed via TransferState
      this.updateAuthState(null, false);
    } else {
      // Fallback for other platforms
      this.updateAuthState(null, false);
    }

    // APP_INITIALIZER completes quickly, allowing app bootstrap to proceed.
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
      const clientExpiryTime = Date.now() + CLIENT_STORAGE_EXPIRY_DURATION_MS;
      localStorage.setItem(CLIENT_SESSION_EXPIRY_KEY, clientExpiryTime.toString());
      console.log(`Client session expiry set to: ${new Date(clientExpiryTime).toISOString()}`);
      // Note: authData.user is NOT saved to localStorage here.
      // The updateAuthState method, typically called after this, handles the in-memory currentUserSubject.
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
      localStorage.removeItem(USER_DATA_KEY); // Keep this to clear any old data if it exists
      localStorage.removeItem(CLIENT_SESSION_EXPIRY_KEY);
      console.log('All client auth data cleared.');
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getAccessToken();
    if (token) {
      return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }
    return new HttpHeaders(); // Return empty headers if no token
  }

  // --- Authentication Methods ---
  login(credentials: LoginCredentials): Observable<User | null> {
    return this.authApiService.login(credentials).pipe(
      map((response: AuthResponse) => {
        if (response.status && response.data) {
          const authData = response.data as AuthData;
          if (authData && authData.access) { // Basic check for AuthData structure
            this.saveAuthData(authData); // Saves tokens to localStorage
            // updateAuthState will set currentUserSubject in memory but NOT save user to localStorage
            this.updateAuthState(authData.user || null, true);
            return authData.user || null;
          } else {
            console.error('Login response data is not in the expected AuthData format or missing access token:', response.data);
            throw new Error('Login successful, but data format is unexpected.');
          }
        }
        const errorMessage = response.message || 'Login failed: Invalid response from server.';
        throw new Error(errorMessage);
      }),
      catchError(error => {
        this.performLogoutCleanup(false);
        const errorMessage = error.message || 'An unknown error occurred during login.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  register(payload: RegisterPayload): Observable<User | null> {
    return this.authApiService.register(payload).pipe(
      map((response: AuthResponse) => {
        console.log('Register API response:', response);
        if (response.status && response.data) {
          const potentialSuccessData = response.data as any;
          if (potentialSuccessData && typeof potentialSuccessData.token === 'object' &&
            potentialSuccessData.token !== null && typeof potentialSuccessData.token.access === 'string') {
            const successData = potentialSuccessData as SuccessRegister;
            const registeredUser: User = {
              id: '', // <<< --- IMPORTANT: Placeholder ID. Resolve this with your backend!
              email: successData.email,
              username: successData.username,
              phone_number: successData.phone_number
            };
            const authDataToSave: AuthData = {
              access: successData.token.access,
              refresh: successData.token.refresh,
              expiry: null,
              user: registeredUser
            };
            this.saveAuthData(authDataToSave); // Saves tokens to localStorage
            // updateAuthState will set currentUserSubject in memory but NOT save user to localStorage
            this.updateAuthState(registeredUser, true);
            return registeredUser;
          } else {
            console.error('Registration response data is not in the expected SuccessRegister format:', response.data);
            throw new Error('Registration successful, but data format is unexpected.');
          }
        }
        const errorMessage = response.message || 'Registration failed: Invalid response from server.';
        throw new Error(errorMessage);
      }),
      catchError(error => {
        this.performLogoutCleanup(false);
        const errorMessage = error.message || 'An unknown error occurred during registration.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout(navigateToLogin: boolean = true): Observable<void> {
    const refreshToken = this.getRefreshToken(); // Get the refresh token from local storage

    // Call the API service, passing the refresh token.
    // The refresh token will be included in the request body by AuthApiService.
    return this.authApiService.logout(refreshToken).pipe(
      tap(() => {
        this.performLogoutCleanup(navigateToLogin);
      }),
      catchError(error => {
        console.warn('[AuthService] Backend logout API call failed. Performing client cleanup anyway.', error);
        this.performLogoutCleanup(navigateToLogin);
        // It's common to still complete the observable successfully from the client's perspective,
        // as the client-side state is cleared.
        return of(undefined);
      }),
      map(() => undefined) // Ensure the observable emits void and completes
    );
  }

  private performLogoutCleanup(navigate: boolean = true): void {
    this.clearAuthData(); // This will remove tokens and USER_DATA_KEY from localStorage
    this.updateAuthState(null, false); // This will set currentUserSubject to null in memory
    if (navigate && isPlatformBrowser(this.platformId)) {
      this.ngZone.run(() => {
        this.router.navigate(['/']);
      });
    }
  }

  /**
   * Changes the current user's password.
   * @param payload Object containing old_password, new_password, and confirm_new_password.
   * @returns Observable indicating the status and message from the API.
   */
  changePassword(payload: { old_password: string; new_password: string; confirm_new_password: string }): Observable<{ status: boolean; message?: string; }> {
    const headers = this.getAuthHeaders();
    return this.authApiService.changePassword(payload, headers);
  }

  // Synchronous check, useful for guards
  public isAuthenticatedSync(): boolean | null {
    // Consider checking token expiry here if you store and parse it
    return this.isAuthenticatedSubject.value;
  }

  // Synchronous check, useful for guards if the state is already known
  public isAuthenticated(): boolean | null {
    return this.isAuthenticatedSubject.value;
  }

  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}

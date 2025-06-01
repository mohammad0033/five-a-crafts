import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthResponse} from '../../features/auth/models/auth-response';
import {LoginCredentials} from '../../features/auth/models/login-credentials';
import {catchError, Observable, tap, throwError} from 'rxjs';
import {Url} from '../constants/base-url';
import {RegisterPayload} from '../../features/auth/models/register-payload';
import {User} from '../../features/auth/models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {

  constructor(private http: HttpClient, ) { }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${Url.baseUrl}/api/user/login/`, credentials);
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${Url.baseUrl}/api/user/register/`, payload);
  }

  logout(refreshToken?: string | null): Observable<AuthResponse> {
    const body = refreshToken ? { refresh: refreshToken } : null;
    return this.http.post<AuthResponse>(`${Url.baseUrl}/api/user/logout/`, body);
  }

  // Endpoint to get user profile using the token (which an interceptor will add)
  getProfile(): Observable<User> {
    // This relies on an HTTP interceptor to add the 'Authorization: Bearer <token>' header
    return this.http.get<User>(`${Url.baseUrl}/api/user/profile/`);
  }

  // Endpoint to check current authentication status / get user profile
  // Relies on the cookie being sent by the browser
  // checkStatus(): Observable<User> {
  //   return this.http.get<User>(`${Url.baseUrl}/api/user/profile/`); // Or a similar endpoint
  // }

  requestOtp(email: string): Observable<{ status: boolean; message?: string; }> {
    // Replace with actual API call
    console.log(`[AuthApiService] Requesting OTP for ${email}`);
    return this.http.post<{ status: boolean; message?: string; }>(`${Url.baseUrl}/api/user/password_reset/`, { email })
      .pipe(
        tap(response => console.log('[AuthApiService] OTP Response:', response)),
        catchError(err => {
          console.error('[AuthApiService] OTP Error:', err);
          return throwError(() => ({ status: false, message: 'Failed to send OTP. Please try again.' }));
        })
      );
  }

  verifyOtpAndResetPassword(payload: { token: string; password: string }): Observable<{ status: boolean; message?: string; }> {
    // Replace with actual API call
    console.log(`[AuthApiService] Resetting password`);
    return this.http.post<{ status: boolean; message?: string; }>(`${Url.baseUrl}/api/user/password_reset/confirm/`, payload)
      .pipe(
        tap(response => console.log('[AuthApiService] Reset Password Response:', response)),
        catchError(err => {
          console.error('[AuthApiService] Reset Password Error:', err);
          return throwError(() => ({ status: false, message: 'Failed to reset password. Please try again.' }));
        })
      );
  }

  changePassword(payload: { old_password: string; new_password: string; confirm_new_password: string }, headers: HttpHeaders): Observable<{ status: boolean; message?: string; }> {
    // Replace with actual API call
    console.log(`[AuthApiService] Changing password`);
    return this.http.patch<{ status: boolean; message?: string; }>(`${Url.baseUrl}/api/user/change_password/`, payload, { headers })
      .pipe(
        tap(response => console.log('[AuthApiService] Change Password Response:', response)),
        catchError(err => {
          console.error('[AuthApiService] Change Password Error:', err);
          return throwError(() => ({ status: false, message: 'Failed to change password. Please try again.' }));
        })
      );
  }
}

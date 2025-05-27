import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
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

  constructor(private http: HttpClient) { }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    // The browser will automatically send the HTTP-only cookie if it exists
    // The backend validates it.
    return this.http.post<AuthResponse>(`${Url.baseUrl}/api/user/login/`, credentials);
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${Url.baseUrl}/api/user/register/`, payload);
  }

  logout(): Observable<AuthResponse> {
    // This endpoint on the backend should clear the HTTP-only cookie
    return this.http.post<AuthResponse>(`${Url.baseUrl}/api/user/logout/`, {});
  }

  // Endpoint to check current authentication status / get user profile
  // Relies on the cookie being sent by the browser
  checkStatus(): Observable<User> {
    return this.http.get<User>(`${Url.baseUrl}/api/user/profile/`); // Or a similar endpoint
  }

  requestOtp(email: string): Observable<{ success: boolean; message?: string; }> {
    // Replace with actual API call
    console.log(`[AuthApiService] Requesting OTP for ${email}`);
    return this.http.post<{ success: boolean; message?: string; }>(`${Url.baseUrl}/api/user/password_reset/`, { email })
      .pipe(
        tap(response => console.log('[AuthApiService] OTP Response:', response)),
        catchError(err => {
          console.error('[AuthApiService] OTP Error:', err);
          return throwError(() => ({ success: false, message: 'Failed to send OTP. Please try again.' }));
        })
      );
  }

  verifyOtpAndResetPassword(payload: { email: string; otp: string; newPassword: string }): Observable<{ success: boolean; message?: string; }> {
    // Replace with actual API call
    console.log(`[AuthApiService] Resetting password for ${payload.email}`);
    return this.http.post<{ success: boolean; message?: string; }>(`${Url.baseUrl}/api/user/password_reset/`, payload)
      .pipe(
        tap(response => console.log('[AuthApiService] Reset Password Response:', response)),
        catchError(err => {
          console.error('[AuthApiService] Reset Password Error:', err);
          return throwError(() => ({ success: false, message: 'Failed to reset password. Please try again.' }));
        })
      );
  }

  changePassword(payload: { currentPassword: string; newPassword: string; confirmPassword: string }): Observable<{ success: boolean; message?: string; }> {
    // Replace with actual API call
    console.log(`[AuthApiService] Changing password`);
    return this.http.patch<{ success: boolean; message?: string; }>(`${Url.baseUrl}/api/user/password_change/`, payload)
      .pipe(
        tap(response => console.log('[AuthApiService] Change Password Response:', response)),
        catchError(err => {
          console.error('[AuthApiService] Change Password Error:', err);
          return throwError(() => ({ success: false, message: 'Failed to change password. Please try again.' }));
        })
      );
  }
}

import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthResponse} from '../../features/auth/models/auth-response';
import {LoginCredentials} from '../../features/auth/models/login-credentials';
import {Observable} from 'rxjs';
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
}

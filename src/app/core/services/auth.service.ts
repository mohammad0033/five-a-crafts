import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();

  constructor() { }

  getIsLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  login(): void {
    this.isLoggedInSubject.next(true);
    console.log('MockAuthService: User logged in.');
  }

  register(): void {
    this.isLoggedInSubject.next(true); // For simplicity, register also logs the user in
    console.log('MockAuthService: User registered and logged in.');
  }

  logout(): void {
    this.isLoggedInSubject.next(false);
    console.log('MockAuthService: User logged out.');
  }
}

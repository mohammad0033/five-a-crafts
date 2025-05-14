import { Injectable } from '@angular/core';
import { Observable, of, delay, tap, map } from 'rxjs';
import { AuthService } from './auth.service';

// This interface defines the structure of PII data.
// It can be shared between frontend and (eventually) backend.
export interface CheckoutPiiData {
  name: string;
  company?: string;
  address: string;
  apartment?: string;
  city: string;
  governorate?: string;
  phone: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class PiiService {
  // Simulate a very simple in-memory "server-side" store for PII.
  // This will only hold PII if the user is "logged in" via AuthService.
  private mockServerPiiStorage: CheckoutPiiData | null = null;

  constructor(private authService: AuthService) {
    // Listen to logout events to clear mock PII
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      if (!isLoggedIn) {
        this.mockServerPiiStorage = null;
        console.log('PiiService (Mock): User logged out, PII cleared from mock server storage.');
      }
    });
  }

  /**
   * Simulates saving PII to a server.
   * @param piiData The PII data to save.
   * @returns Observable indicating success or failure.
   */
  savePii(piiData: CheckoutPiiData): Observable<{ success: boolean; message: string }> {
    if (!this.authService.getIsLoggedIn()) {
      console.warn('PiiService (Mock): User not logged in. Cannot save PII.');
      return of({ success: false, message: 'User not authenticated (mock)' }).pipe(delay(300));
    }

    console.log('PiiService (Mock): Simulating API call to save PII:', piiData);
    // Simulate network delay and server processing
    return of(null).pipe(
      delay(1000),
      tap(() => {
        this.mockServerPiiStorage = { ...piiData };
        console.log('PiiService (Mock): PII saved to mock server storage.');
      }),
      map(() => ({ success: true, message: 'PII saved successfully (mocked)' }))
    );
  }

  /**
   * Simulates loading PII from a server.
   * @returns Observable containing PII data or null.
   */
  loadPii(): Observable<CheckoutPiiData | null> {
    if (!this.authService.getIsLoggedIn()) {
      console.warn('PiiService (Mock): User not logged in. Cannot load PII.');
      return of(null).pipe(delay(300));
    }

    console.log('PiiService (Mock): Simulating API call to load PII.');
    // Simulate network delay
    return of(null).pipe(
      delay(800),
      map(() => {
        if (this.mockServerPiiStorage) {
          console.log('PiiService (Mock): PII loaded from mock server storage:', this.mockServerPiiStorage);
          return { ...this.mockServerPiiStorage }; // Return a copy
        }
        console.log('PiiService (Mock): No PII found in mock server storage for current user.');
        return null;
      })
    );
  }

  /**
   * Simulates clearing PII from a server.
   * @returns Observable indicating success or failure.
   */
  clearPii(): Observable<{ success: boolean; message: string }> {
    if (!this.authService.getIsLoggedIn()) {
      console.warn('PiiService (Mock): User not logged in. Cannot clear PII.');
      return of({ success: false, message: 'User not authenticated (mock)' }).pipe(delay(300));
    }

    console.log('PiiService (Mock): Simulating API call to clear PII.');
    // Simulate network delay
    return of(null).pipe(
      delay(700),
      tap(() => {
        this.mockServerPiiStorage = null;
        console.log('PiiService (Mock): PII cleared from mock server storage.');
      }),
      map(() => ({ success: true, message: 'PII cleared successfully (mocked)' }))
    );
  }
}

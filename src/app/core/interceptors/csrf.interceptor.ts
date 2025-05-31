import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

// Helper function to get a cookie by name
// This function should only be called in a browser environment.
function getCookie(name: string, doc: Document): string | null {
  const nameEQ = name + "=";
  const ca = doc.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export const csrfInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    // IMPORTANT: Verify the exact name of your CSRF cookie.
    // Open your browser's developer tools (Application > Cookies)
    // after logging in or visiting a page that sets it.
    // It's often 'csrftoken', even if set with '__Secure-' prefix by the backend.
    const csrfCookieName = '__Secure-csrftoken'; // <<--- ADJUST THIS IF NEEDED
    const csrfToken = getCookie(csrfCookieName, document); // 'document' is safe here due to isPlatformBrowser check

    // Only add CSRF token for state-changing methods and if the token exists
    if (csrfToken && (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE' || req.method === 'PATCH')) {
      const clonedReq = req.clone({
        headers: req.headers.set('X-CSRFToken', csrfToken)
      });
      return next(clonedReq);
    }
  }

  // For GET requests or if not in browser or no CSRF token, pass the original request
  return next(req);
};

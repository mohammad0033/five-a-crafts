import {ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot} from '@angular/router';
import {PageMetadata} from '../../../core/models/page-meta-data';
import {catchError, map, Observable, of} from 'rxjs';
import {inject} from '@angular/core';
import {ContentService} from '../../../core/services/content.service';

export const homePageMetaResolver: ResolveFn<PageMetadata | null> = (
  _route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
): Observable<PageMetadata | null> => {
  // Inject the ContentService using the inject function
  const contentService = inject(ContentService);

  // Call the service method to get metadata
  return contentService.getHomePageMetadata().pipe(
    map(metadata => metadata), // Optional: can add transformations here if needed
    catchError(error => {
      console.error('Error fetching home page metadata in resolver:', error);
      // Return an observable emitting null on error to allow component loading with fallbacks
      return of(null);
    })
  );
};

import {ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot} from '@angular/router';
import {PageMetadata} from '../../../core/models/page-meta-data';
import {catchError, map, Observable, of} from 'rxjs';
import {inject} from '@angular/core';
import {ContentApiService} from '../../../core/services/content-api.service';

export const homePageMetaResolver: ResolveFn<PageMetadata | null> = (
  _route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
): Observable<PageMetadata | null> => {
  // Inject the ContentApiService using the inject function
  const contentService = inject(ContentApiService);

  // Call the service method to get metaData
  return contentService.getHomePageMetadata().pipe(
    map(metaData => metaData), // Optional: can add transformations here if needed
    catchError(error => {
      console.error('Error fetching home page metaData in resolver:', error);
      // Return an observable emitting null on error to allow component loading with fallbacks
      return of(null);
    })
  );
};

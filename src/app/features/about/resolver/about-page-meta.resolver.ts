import {ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot} from '@angular/router';
import {PageMetadata} from '../../../core/models/page-meta-data';
import {catchError, map, Observable, of} from 'rxjs';
import {inject} from '@angular/core';
import {ContentApiService} from '../../../core/services/content-api.service';

export const aboutPageMetaResolver: ResolveFn<PageMetadata | null> = (
  _route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
): Observable<PageMetadata | null> => {
  const contentService = inject(ContentApiService);

  // Assume contentService has a method getAboutPageMetadata()
  return contentService.getAboutPageMetadata().pipe( // Use the new method
    map(metaData => metaData),
    catchError(error => {
      console.error('Error fetching about page metaData in resolver:', error);
      return of(null); // Return null on error
    })
  );
};

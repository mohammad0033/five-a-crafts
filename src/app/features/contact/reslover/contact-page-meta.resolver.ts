import {ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot} from '@angular/router';
import {inject} from '@angular/core';
import {PageMetadata} from '../../../core/models/page-meta-data';
import {catchError, map, Observable, of} from 'rxjs';
import {ContentService} from '../../../core/services/content.service';

export const contactPageMetaResolver: ResolveFn<PageMetadata | null> = (
  _route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
): Observable<PageMetadata | null> => {
  const contentService = inject(ContentService);

  return contentService.getContactPageMetadata().pipe(
    map(metadata => metadata),
    catchError(error => {
      console.error('Error fetching contact page metadata in resolver:', error);
      return of(null); // Return null on error
    })
  );
};

import {ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot} from '@angular/router';
import {PageMetadata} from '../../../core/models/page-meta-data';
import {catchError, map, Observable, of} from 'rxjs';
import {inject} from '@angular/core';
import {ContentService} from '../../../core/services/content.service';

export const categoriesPageMetaResolver: ResolveFn<PageMetadata | null> = (
  _route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
): Observable<PageMetadata | null> => {
  const contentService = inject(ContentService);

  // Assume contentService has a method getCategoriesPageMetadata()
  // This would fetch metadata for the main categories overview page
  return contentService.getCategoriesPageMetadata().pipe(
    map(metadata => metadata),
    catchError(error => {
      console.error('Error fetching categories page metadata in resolver:', error);
      return of(null); // Return null on error
    })
  );
};

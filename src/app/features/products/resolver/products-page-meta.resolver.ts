import {ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot} from '@angular/router';
import {PageMetadata} from '../../../core/models/page-meta-data';
import {catchError, map, Observable, of} from 'rxjs';
import {inject} from '@angular/core';
import {ContentApiService} from '../../../core/services/content-api.service';

export const productsPageMetaResolver: ResolveFn<PageMetadata | null> = (
  _route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
): Observable<PageMetadata | null> => {
  const contentService = inject(ContentApiService);

  // This would fetch metaData for the main products overview page
  return contentService.getProductsPageMetadata().pipe(
    map(metaData => metaData),
    catchError(error => {
      console.error('Error fetching products page metaData in resolver:', error);
      return of(null); // Return null on error
    })
  );
};

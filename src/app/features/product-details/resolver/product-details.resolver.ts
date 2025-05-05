import {ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot} from '@angular/router';
import {inject} from '@angular/core';
import {ProductDetailsData} from '../models/product-details-data';
import {catchError, Observable, of} from 'rxjs';
import {ProductsApiService} from '../../../core/services/products-api.service';

export const productDetailsResolver: ResolveFn<ProductDetailsData | null> = (
  route: ActivatedRouteSnapshot, // We need the route to access parameters
  _state: RouterStateSnapshot   // State is often unused but required by the signature
): Observable<ProductDetailsData | null> => {

  // Inject the ProductsApiService
  const productsService = inject(ProductsApiService);

  // Get the product slug from the route parameters
  const productSlug = route.paramMap.get('productSlug');

  // Check if the slug exists
  if (!productSlug) {
    console.error('Product slug parameter ("productSlug") not found in route.');
    // Return null to allow navigation to the component, which can then handle the error state
    return of(null);
  }

  // Call the service method to get the full product details
  return productsService.getProductDetails(productSlug).pipe(
    catchError(error => {
      console.error(`Error fetching product details for slug "${productSlug}" in resolver:`, error);
      // Return null on error (e.g., product not found / API error)
      // The component will need to handle this null case
      return of(null);
    })
  );
};

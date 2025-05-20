import {ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot} from '@angular/router';
import {inject} from '@angular/core';
import {ProductDetailsData} from '../models/product-details-data';
import {catchError, EMPTY, Observable} from 'rxjs';
import {ProductsService} from '../../../core/services/products.service';

export const productDetailsResolver: ResolveFn<ProductDetailsData | null> = (
  route: ActivatedRouteSnapshot, // We need the route to access parameters
  _state: RouterStateSnapshot   // State is often unused but required by the signature
): Observable<ProductDetailsData | null> => {

  // Inject the ProductsApiService
  const productsService = inject(ProductsService);
  const router = inject(Router); // Inject Router
  // Get the product slug from the route parameters
  const productSlug = route.paramMap.get('productSlug');

  // Check if the slug exists
  if (!productSlug) {
    console.error('Product slug parameter ("productSlug") not found in route.');
    router.navigate(['/not-found']); // Or your preferred 404 route
    return EMPTY; // Prevent component from loading
  }

  // Call the service method to get the full product details
  return productsService.getProductDetails(productSlug).pipe(
    catchError(error => {
      console.error(`Error fetching product details for slug "${productSlug}" in resolver:`, error);
      // You could inspect the error here. If it's an API 404, this is appropriate.
      // For other server errors, you might consider a generic error page.
      router.navigate(['/not-found']); // Or your preferred 404 route
      return EMPTY; // Prevent component from loading
    })
  );
};

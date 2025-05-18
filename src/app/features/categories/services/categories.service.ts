import { Injectable } from '@angular/core';
import {map, Observable} from 'rxjs';
import {CategoriesApiService} from '../../../core/services/categories-api.service';
import {Category} from '../../../core/models/category';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  constructor(private categoriesApiService: CategoriesApiService) { }

  getCategoriesData(): Observable<Category[]> {
    return this.categoriesApiService.getCategoriesData().pipe(
      map(response => { // Use the 'map' operator to transform the response
        if (response && response.data) {
          return response.data as Category[]; // Extract and return the array from the 'data' property
        } else {
          // Handle cases where the response or data is not in the expected format
          console.error('Unexpected API response format:', response);
          return []; // Or throw an error: throw new Error('Invalid categories data');
        }
      })
    );
  }
}

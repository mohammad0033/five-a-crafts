import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {CategoriesApiService} from '../../../core/services/categories-api.service';
import {Category} from '../../../core/models/category';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  constructor(private categoriesApiService: CategoriesApiService) { }

  getCategoriesData(): Observable<Category[]> {
    return this.categoriesApiService.getCategoriesData();
  }
}

import { Injectable } from '@angular/core';
import {delay, Observable, of} from 'rxjs';
import {Category} from '../models/category';

@Injectable({
  providedIn: 'root'
})
export class CategoriesApiService {

  constructor() { }

  getCategoriesData(): Observable<any[]> {

    const mockCategoriesData: Category[] = [
      {
        id: 1,
        name: 'Candles',
        description: 'Discover our potent unique candles collection.',
        image: 'https://picsum.photos/id/1063/300/300'
      },
      {
        id: 2,
        name: 'Decor',
        description: 'Discover our unique home decor collection.',
        image: 'https://picsum.photos/id/1064/300/300'
      },
      {
        id: 3,
        name: 'Ramadan',
        description: 'Discover our unique Ramadan collection.',
        image: 'https://picsum.photos/id/1065/300/300'
      },
      {
        id: 4,
        name: 'Gifts',
        description: 'Discover our unique gifts collection.',
        image: 'https://picsum.photos/id/1066/300/300'
      }
    ]

    // Use `of` and `delay` to simulate a network request
    // In a real scenario, this would be an HttpClient call:
    // return this.http.get<CategoriesItem[]>('/api/carousel-data');
    return of(mockCategoriesData).pipe(delay(1000)); // Simulate 500ms delay
  }
}

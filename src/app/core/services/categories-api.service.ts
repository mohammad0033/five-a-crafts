import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Url} from '../constants/base-url';
import {CommonApiResponse} from '../models/common-api-response';

@Injectable({
  providedIn: 'root'
})
export class CategoriesApiService {

  constructor(private http: HttpClient) {}

  getCategoriesData():Observable<CommonApiResponse>{
    return this.http.get<CommonApiResponse>(`${Url.baseUrl}/api/oscar/categories/`);
  }
}

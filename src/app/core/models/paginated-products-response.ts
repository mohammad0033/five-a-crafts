import {Product} from './product';

export interface PaginatedProductsResponse {
  products: Product[];
  totalCount: number;
}

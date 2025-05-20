import {Category} from './category';
import {Product} from './product';

export interface CategoryWithProducts extends Category {
  products: Product[];
  isLoadingProducts: boolean; // Optional: for individual loading spinners per category
}

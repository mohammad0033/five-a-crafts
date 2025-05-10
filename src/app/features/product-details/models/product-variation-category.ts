import {ProductVariationOption} from './product-variation-option';

export interface ProductVariationCategory {
  id: string; // A unique identifier for the category, e.g., 'color', 'gold-paper'
  name: string; // Display name for the category, e.g., 'Color', 'Gold Paper Type'
  options: ProductVariationOption[];
  selectedValue?: string; // To store the value of the currently selected option for this category
}

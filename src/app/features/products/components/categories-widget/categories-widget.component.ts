import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatCheckbox} from '@angular/material/checkbox';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {NgForOf, NgIf} from '@angular/common';
import {Category} from '../../../../core/models/category';

@UntilDestroy()
@Component({
  selector: 'app-categories-widget',
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    MatCheckbox,
    NgForOf,
    NgIf
  ],
  templateUrl: './categories-widget.component.html',
  standalone: true,
  styleUrl: './categories-widget.component.scss'
})
export class CategoriesWidgetComponent implements OnInit, OnChanges {
  // Input to receive categories from the parent
  @Input() availableCategories: Category[] | null = []; // Allow null for async pipe initially
  // Output event emitter to send selected category IDs (or slugs) to the parent
  @Output() categorySelectionChange = new EventEmitter<number[]>(); // Emitting array of category IDs

  // Use a FormGroup to contain the FormArray for better structure
  categoryForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    // Initialize the form group with an empty FormArray named 'selectedCategories'
    this.categoryForm = this.fb.group({
      selectedCategories: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Subscribe to value changes of the FormArray
    // This observable emits an array of boolean values corresponding to the checkboxes
    this.categoryFormArray.valueChanges.pipe(
      untilDestroyed(this) // Automatically unsubscribe when the component is destroyed
    ).subscribe((values: boolean[]) => {
      if (!this.availableCategories) return;
      // Map the boolean values back to the category names
      // Filter the original categories array based on the boolean values from the form array
      const selectedCategoryIds = this.availableCategories
        .filter((category, index) => values[index])
        .map(category => category.id); // Or category.slug

      // Emit the array of selected category names to the parent
      this.categorySelectionChange.emit(selectedCategoryIds);
    });
  }
  // Use ngOnChanges to react when the input 'availableCategories' changes
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['availableCategories'] && this.availableCategories) {
      this.rebuildForm();
    }
  }

  // Helper getter to easily access the FormArray
  get categoryFormArray(): FormArray<FormControl<boolean>> {
    return this.categoryForm.get('selectedCategories') as FormArray<FormControl<boolean>>;
  }

  private rebuildForm(): void {
    // Clear existing controls
    while (this.categoryFormArray.length !== 0) {
      this.categoryFormArray.removeAt(0);
    }

    // Populate the FormArray with a FormControl for each available category
    if (this.availableCategories) {
      this.availableCategories.forEach(() => {
        this.categoryFormArray.push(this.fb.control(false) as FormControl<boolean>);
      });
    }
  }

  /**
   * Clears all selected categories in the widget.
   * This method can be called from the parent component.
   */
  public clearSelection(): void {
    this.categoryForm.reset(); // Resets the form group, setting checkbox controls to their initial (false) state.
                               // The valueChanges subscription will then emit an empty array.
  }

}

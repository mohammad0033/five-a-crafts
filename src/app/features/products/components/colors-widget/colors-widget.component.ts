import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {MatCheckbox} from '@angular/material/checkbox';
import {NgForOf, NgIf} from '@angular/common';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {Color} from '../../../../core/models/color';

@UntilDestroy()
@Component({
  selector: 'app-colors-widget',
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    MatCheckbox,
    NgForOf,
    NgIf
  ],
  templateUrl: './colors-widget.component.html',
  standalone: true,
  styleUrl: './colors-widget.component.scss'
})
export class ColorsWidgetComponent implements OnInit, OnChanges {
  @Input() availableColors: Color[] | null = []; // Allow null for async pipe
  // Output event emitter to send selected colors to the parent
  @Output() colorSelectionChange = new EventEmitter<string[]>();

  // Use a FormGroup to contain the FormArray for better structure
  colorForm!: FormGroup;
  // This internal 'colors' array will be derived from 'availableColors'
  // It's used by the existing logic that maps boolean values back to color names.
  private _currentColorsForForm: string[] = [];

  constructor(private fb: FormBuilder) {
    // Initialize the form group with an empty FormArray named 'selectedColors'
    this.colorForm = this.fb.group({
      selectedColors: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Subscription logic remains largely the same, but uses _currentColorsForForm
    this.colorFormArray.valueChanges.pipe(
      untilDestroyed(this)
    ).subscribe((values: boolean[]) => {
      if (!this.availableColors) return;

      const selectedColorNames = this._currentColorsForForm
        .filter((colorName, index) => values[index]);

      this.colorSelectionChange.emit(selectedColorNames);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['availableColors'] && this.availableColors) {
      // Update the internal list of color names used for mapping
      this._currentColorsForForm = this.availableColors.map(color => color.name);
      this.rebuildForm();
    }
  }

  // Helper getter to easily access the FormArray
  get colorFormArray(): FormArray<FormControl<boolean>> {
    return this.colorForm.get('selectedColors') as FormArray<FormControl<boolean>>;
  }

  private rebuildForm(): void {
    while (this.colorFormArray.length !== 0) {
      this.colorFormArray.removeAt(0);
    }

    if (this.availableColors) {
      this.availableColors.forEach(() => {
        this.colorFormArray.push(this.fb.control(false) as FormControl<boolean>);
      });
    }
  }

  /**
   * Clears all selected colors in the widget.
   * This method can be called from the parent component.
   */
  public clearSelection(): void {
    this.colorForm.reset(); // Resets the form group, which will set all checkbox controls to their initial (false) state.
                            // The valueChanges subscription will then emit an empty array.
  }

}

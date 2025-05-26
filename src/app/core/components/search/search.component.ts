import {Component, EventEmitter, Output, OnInit, Input} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {debounceTime, distinctUntilChanged, filter} from 'rxjs';
import {MatProgressSpinner} from '@angular/material/progress-spinner'; // For translations

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    TranslateModule,
    MatProgressSpinner
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'] // Corrected to styleUrls
})
export class SearchComponent implements OnInit{
  searchControl = new FormControl('');

  @Output() search = new EventEmitter<string>();
  @Input() isLoadingSearchResults: boolean = false;

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      // Keep the filter to trigger only when length is >= 3 or is empty (for clearing)
      filter((text): text is string => {
        if (text === null || text === undefined) return false;
        const trimmedText = text.trim();
        return trimmedText.length >= 3 || trimmedText.length === 0; // Allow empty string for clearing
      })
    ).subscribe((searchTerm: string) => {
      this.search.emit(searchTerm.trim()); // Emit the trimmed search term
    });
  }

  // This method is called when the form is submitted (e.g., by pressing Enter)
  handleFormSubmit(): void {
    const currentValue = this.searchControl.value;
    if (currentValue !== null && currentValue !== undefined) {
      const trimmedValue = currentValue.trim();
      // You can choose to emit immediately on submit, or let the valueChanges pipe handle it.
      // Letting valueChanges handle it ensures debounce/distinctUntilChanged/filter logic is applied.
      // If you want immediate submit, you could do:
      // if (trimmedValue.length >= 3 || trimmedValue.length === 0) {
      //   this.search.emit(trimmedValue);
      // }
      // For now, we'll rely on valueChanges which is triggered by the input change.
      // This method primarily prevents the default form submission (page reload).
    }
  }

  /**
   * Public method to clear the search input.
   * Can be called by a parent component.
   */
  public clearSearch(): void {
    this.searchControl.setValue('');
    // The valueChanges subscription will emit an empty string due to the updated filter logic.
  }
}

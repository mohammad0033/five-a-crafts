import {Component, Inject, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {NgIf} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {UserAddress} from '../../models/user-address';

@Component({
  selector: 'app-address-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    NgIf,
    TranslatePipe,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions
  ],
  templateUrl: './address-form.component.html',
  standalone: true,
  styleUrl: './address-form.component.scss'
})
export class AddressFormComponent implements OnInit {
  addressForm: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddressFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserAddress | null // Can be null if adding new
  ) {
    this.addressForm = this.fb.group({
      id: [null], // Keep id for updates
      title: ['', Validators.required],
      details: ['', Validators.required],
      isDefault: [false]
    });

    if (data) {
      this.isEditMode = true;
      this.addressForm.patchValue(data);
    }
  }

  ngOnInit(): void {
  }

  onSave(): void {
    if (this.addressForm.valid) {
      this.dialogRef.close(this.addressForm.value);
    } else {
      this.addressForm.markAllAsTouched(); // Show validation errors
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

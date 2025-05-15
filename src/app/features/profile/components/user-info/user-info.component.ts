import {Component, OnInit} from '@angular/core';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {NgIf} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {ProfileService} from '../../services/profile.service';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {finalize} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {ProfileResolvedData} from '../../resolvers/profile.resolver';

@UntilDestroy()
@Component({
  selector: 'app-user-info',
  imports: [
    MatError,
    MatFormField,
    MatInput,
    NgIf,
    ReactiveFormsModule,
    TranslatePipe,
    FaIconComponent
  ],
  templateUrl: './user-info.component.html',
  standalone: true,
  styleUrl: './user-info.component.scss'
})
export class UserInfoComponent implements OnInit {
  userInfoForm!: FormGroup;
  isEditMode: boolean = false;
  isLoading: boolean = true;
  isLoadingSave: boolean = false; // Differentiates saving loader text
  private initialFormValue: any;

  faEdit = faEdit;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.userInfoForm = this.fb.group({
      name: ['', Validators.required],
      company: [''],
      address: ['', Validators.required],
      apartment: [''],
      city: ['', Validators.required],
      governorate: [''],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.loadUserInfo();
  }

  loadUserInfo(): void { // Changed to void as it's handled by subscription
    this.isLoading = true;
    this.isLoadingSave = false; // Ensure this is false when loading initially

    this.route.parent?.data.pipe(
      finalize(() => {
        this.isLoading = false;
      }),
      untilDestroyed(this)
    ).subscribe(data => {
      const resolvedData = data['profilePageData'] as ProfileResolvedData;
      if (resolvedData && resolvedData.userInfo) {
        this.userInfoForm.patchValue(resolvedData.userInfo);
        this.initialFormValue = this.userInfoForm.value;
        // ...
        this.isLoading = false; // Data is pre-loaded
      } else {
        // Handle case where userInfo might be null due to resolver error
        this.isLoading = false;
      }
    });
  }

  enterEditMode(): void {
    this.isEditMode = true;
    // Optional: auto-focus the first field for better UX
    // setTimeout(() => document.getElementById('edit-first-name')?.focus(), 0);
  }

  saveUserInfo(): void { // Changed to void
    if (this.userInfoForm.invalid || !this.userInfoForm.dirty) {
      // Optionally mark all fields as touched to show validation errors
      this.userInfoForm.markAllAsTouched();
      return;
    }

    this.isLoading = true; // Use main loading flag for saving state
    this.isLoadingSave = true; // Use specific flag for text
    const formData = this.userInfoForm.value;

    this.profileService.updateUserInfo(formData).pipe(
      untilDestroyed(this)
    ).subscribe({
      next: (updatedUserData) => {
        this.initialFormValue = updatedUserData;
        this.userInfoForm.reset(this.initialFormValue);
        this.isEditMode = false;
        // this.notificationService.showSuccess('User information saved successfully!'); // Optional
        console.log('User info saved:', updatedUserData);
      },
      error: (error) => {
        console.error('Error saving user info:', error);
        // this.notificationService.showError('Failed to save user information.'); // Optional
        // Keep in edit mode on error, form retains unsaved values
      },
      complete: () => {
        this.isLoading = false;
        this.isLoadingSave = false;
      }
    });
  }

  cancelEdit(): void {
    this.userInfoForm.reset(this.initialFormValue); // Revert to original values
    this.isEditMode = false;
  }
}

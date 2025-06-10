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
import {UserInfo} from '../../models/user-info';

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
      name: [''],
      phone_number: [''],
      email: ['', [Validators.required, Validators.email]]
    });

    this.loadInitialFormValues();
  }

  loadInitialFormValues(): void {
    this.isLoading = true;
    // Option 1: Use data from resolver (if ProfileService isn't populated yet by ProfileComponent)
    this.route.parent?.data.pipe(
      untilDestroyed(this)
    ).subscribe(data => {
      const resolvedData = data['profilePageData'] as ProfileResolvedData;
      console.log('UserInfoComponent resolved data:', resolvedData);
      if (resolvedData && resolvedData.userInfo) {
        let userInfo = Array.isArray(resolvedData.userInfo) ? resolvedData.userInfo : [resolvedData.userInfo];
        this.patchForm(userInfo[0]);
      }
      this.isLoading = false;
    });

    // Option 2: Or, if ProfileService is guaranteed to be populated by ProfileComponent first,
    // you could subscribe to profileService.userInfo$ here for initial values.
    // However, resolver data is often more direct for initial child component setup.
  }

  private patchForm(userInfo: UserInfo | null): void {
    if (userInfo) {
      console.log('Patching form with initial user info:', userInfo);
      this.userInfoForm.patchValue(userInfo);
      console.log('Patched form value:', this.userInfoForm.value);
      this.initialFormValue = this.userInfoForm.value;
      console.log('Initial form value:', this.initialFormValue);
    }
  }

  enterEditMode(): void {
    this.isEditMode = true;
    // Optional: auto-focus the first field for better UX
    // setTimeout(() => document.getElementById('edit-first-name')?.focus(), 0);
  }

  saveUserInfo(): void {
    if (this.userInfoForm.invalid || !this.userInfoForm.dirty) {
      this.userInfoForm.markAllAsTouched();
      return;
    }

    this.isLoadingSave = true;
    let formData = this.userInfoForm.value as Partial<UserInfo>;
    if (formData.phone_number?.length === 0) {
      formData.phone_number = undefined
    } else {
      if (formData.phone_number?.startsWith('+2')) {
        formData.phone_number = formData.phone_number.slice(2)
      }
      formData.phone_number = '+2' + formData.phone_number
    }
    this.userInfoForm.disable()

    // The profileService.updateUserInfo method now handles updating the BehaviorSubject internally
    this.profileService.updateUserInfo(formData).pipe(
      untilDestroyed(this),
      finalize(() => {
        this.isLoadingSave = false
        this.userInfoForm.enable()
      })
    ).subscribe({
      next: (updatedUserData) => {
        // The BehaviorSubject is already updated by the service.
        // We just need to reset the form's state and UI.
        this.initialFormValue = updatedUserData; // Use the fresh data from API
        this.userInfoForm.reset(this.initialFormValue);
        this.isEditMode = false;
        console.log('User info saved and shared state updated:', updatedUserData);
        // Optional: Show success notification
      },
      error: (error) => {
        console.error('Error saving user info:', error);
        // Optional: Show error notification
      }
    });
  }

  cancelEdit(): void {
    this.userInfoForm.reset(this.initialFormValue); // Revert to original values
    this.isEditMode = false;
  }
}

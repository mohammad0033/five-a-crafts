import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { finalize } from 'rxjs/operators';
import { passwordMatchValidator } from '../../../../shared/validators/password-match.validator';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    TranslatePipe
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm!: FormGroup;
  isLoading = false;
  oldPasswordVisible = false;
  newPasswordVisible = false;
  confirmPasswordVisible = false;
  currentLang = '';

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);

  ngOnInit(): void {
    this.changePasswordForm = this.fb.group({
      old_password: ['', [Validators.required, Validators.minLength(8)]],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_new_password: ['', [Validators.required]]
    }, {
      // Use the shared validator
      validators: passwordMatchValidator('new_password', 'confirm_new_password')
    });

    this.currentLang = this.translate.currentLang;
    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe((event) => {
      this.currentLang = event.lang;
    })
  }

  // Convenience getters for easy access to form controls in the template
  get oldPassword() { return this.changePasswordForm.get('old_password'); }
  get newPassword() { return this.changePasswordForm.get('new_password'); }
  get confirmNewPassword() { return this.changePasswordForm.get('confirm_new_password'); }

  onSubmit(): void {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { old_password, new_password, confirm_new_password } = this.changePasswordForm.value;

    this.authService.changePassword({ old_password, new_password, confirm_new_password })
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          if (response.status) {
            this.snackBar.open(response.message || 'Password changed successfully!', 'Close', {
              duration: 3000,
              // set attribute direction based on locale
              direction: this.currentLang === 'ar' ? "rtl" : "ltr"
            });
            this.changePasswordForm.reset();
            Object.keys(this.changePasswordForm.controls).forEach(key => {
              this.changePasswordForm.get(key)?.setErrors(null);
              this.changePasswordForm.get(key)?.markAsUntouched();
              this.changePasswordForm.get(key)?.markAsPristine();
            });
            this.changePasswordForm.updateValueAndValidity();
          } else {
            this.snackBar.open(response.message || 'Failed to change password. Please try again.', 'Close', {
              duration: 5000,
              // set attribute direction based on locale
              direction: this.currentLang === 'ar' ? "rtl" : "ltr"
            });
          }
        },
        error: (err) => {
          const errorMessage = err.message || 'An unexpected error occurred. Please try again.';
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            // set attribute direction based on locale
            direction: this.currentLang === 'ar' ? "rtl" : "ltr"
          });
        }
      });
  }

  togglePasswordVisibility(field: 'old' | 'new' | 'confirm'): void {
    if (field === 'old') this.oldPasswordVisible = !this.oldPasswordVisible;
    else if (field === 'new') this.newPasswordVisible = !this.newPasswordVisible;
    else if (field === 'confirm') this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }
}

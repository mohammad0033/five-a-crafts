import {Component, Inject, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {NgIf} from '@angular/common';
import {AuthApiService} from '../../../../core/services/auth-api.service';
import {passwordMatchValidator} from '../../../../shared/validators/password-match.validator';

@Component({
  selector: 'app-reset-password',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    NgIf
  ],
  templateUrl: './reset-password.component.html',
  standalone: true,
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  errorMessage: string | null = null;
  isLoading: boolean = false;
  hideNewPassword = true;
  hideConfirmPassword = true;
  email: string;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ResetPasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { email: string },
    private translate: TranslateService,
    private authApiService: AuthApiService
  ) {
    this.email = data.email;
  }

  ngOnInit(): void {
    this.resetPasswordForm = this.fb.group({
      token: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      // Use the shared validator
      validators: passwordMatchValidator('password', 'confirmPassword')
    });
  }

  // Convenience getters for template
  get tokenControl() { return this.resetPasswordForm.get('token'); }
  get passwordControl() { return this.resetPasswordForm.get('password'); }
  get confirmPasswordControl() { return this.resetPasswordForm.get('confirmPassword'); }

  onSubmit(): void {
    this.errorMessage = null;
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true; // Set loading true
    const { token, password } = this.resetPasswordForm.value;
    const payload = {token, password };

    this.authApiService.verifyOtpAndResetPassword(payload).subscribe({ // Use the injected service
      next: (response) => {
        this.isLoading = false;
        console.log(response);
        if (response.status) {
          this.dialogRef.close({ passwordReset: true });
        } else {
          this.errorMessage = response.message || this.translate.instant('auth.passwordResetFailed');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || this.translate.instant('auth.passwordResetFailed');
        console.error('Password Reset Error:', err);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

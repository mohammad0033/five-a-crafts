import {Component, Inject, OnInit} from '@angular/core';
import {catchError, Observable, of, tap, throwError} from 'rxjs';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {NgIf} from '@angular/common';
import {AuthApiService} from '../../../../core/services/auth-api.service';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    TranslateModule,
    NgIf
  ],
  templateUrl: './forgot-password.component.html',
  standalone: true,
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  errorMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ForgotPasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, // Not strictly needed for this dialog but good practice
    private translate: TranslateService,
    private authApiService: AuthApiService // Inject your actual service here
  ) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    this.errorMessage = null;
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true; // Set loading true before API call
    const email = this.forgotPasswordForm.value.email;

    this.authApiService.requestOtp(email).subscribe({ // Use the injected service
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.dialogRef.close({ emailSent: true, email: email });
        } else {
          this.errorMessage = response.message || this.translate.instant('auth.otpSendFailed');
        }
      },
      error: (err) => {
        this.isLoading = false;
        // err from AuthApiService already has a message or is the HttpErrorResponse
        this.errorMessage = err.message || this.translate.instant('auth.otpSendFailed');
        console.error('OTP Send Error:', err);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

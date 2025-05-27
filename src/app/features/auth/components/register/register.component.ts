import {Component, OnInit, Optional} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {NgIf} from '@angular/common';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {AuthApiService} from '../../../../core/services/auth-api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    MatFormFieldModule, // Add MatFormFieldModule
    MatInputModule,     // Add MatInputModule
    MatButtonModule,    // Add MatButtonModule
    MatIconModule,      // Add MatIconModule
    NgIf,
    MatDialogModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  hidePassword = true;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder,
              private authApiService: AuthApiService,
              private translate: TranslateService,
              @Optional() public dialogRef?: MatDialogRef<RegisterComponent>) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      user_name: ['', [Validators.required]], // Assuming 'user_name' is the desired form control name
      password: ['', [Validators.required, Validators.minLength(8)]] // Add more validators as needed (e.g., Validators.minLength(8))
    });
  }

  submitRegister(): void {
    this.errorMessage = null; // Reset error
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true; // Set loading
    this.registerForm.disable(); // Disable form

    this.authApiService.register(this.registerForm.value).subscribe({
      next: (response) => {
        this.isLoading = false; // Unset loading
        this.registerForm.enable(); // Enable form
        if (response.success) {
          console.log('Registration successful', response.user);
          if (this.dialogRef) {
            this.dialogRef.close({ registered: true }); // Close dialog on success
          } else {
            // Handle success if it's a standalone page (e.g., navigate to login)
            // This scenario is less likely if you're using the dialog flow primarily
          }
        } else {
          this.errorMessage = response.message || this.translate.instant('auth.registrationFailed');
        }
      },
      error: (err) => {
        this.isLoading = false; // Unset loading
        this.registerForm.enable(); // Enable form
        console.error('Registration failed', err);
        // Use the specific error message from the backend if available, otherwise fallback
        this.errorMessage = err.error?.message || err.message || this.translate.instant('auth.registrationFailed');
      }
    });
  }

  // Method to close the dialog and signal to go back to login
  backToLogin(): void {
    if (this.dialogRef) {
      this.dialogRef.close({ action: 'backToLogin' });
    }
    // If not a dialog, maybe navigate? But the dialog flow is primary here.
  }

  // Method to close the dialog without action (e.g., clicking X or ESC if disableClose is false)
  closeDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}

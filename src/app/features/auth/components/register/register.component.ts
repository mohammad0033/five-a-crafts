import {Component, OnInit, Optional} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {NgIf} from '@angular/common';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {AuthService} from '../../../../core/services/auth.service';
import {Router} from '@angular/router';
import {User} from '../../models/user';

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
  intendedRoute?: string;
  isDialog: boolean = false;

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private translate: TranslateService,
              private router: Router,
              @Optional() public dialogRef?: MatDialogRef<RegisterComponent>) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]], // Assuming 'username' is the desired form control name
      password: ['', [Validators.required, Validators.minLength(8)]] // Add more validators as needed (e.g., Validators.minLength(8))
    });
  }

  submitRegister(): void {
    this.errorMessage = null;
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.registerForm.disable();

    this.authService.register(this.registerForm.value).subscribe({
      next: (user: User | null) => {
        this.isLoading = false;
        this.registerForm.enable();
        console.log('Registration successful and user auto-logged in:', user);

        if (this.isDialog && this.dialogRef) {
          // If it's a dialog, close and return success and the intended route
          this.dialogRef.close({
            registeredAndLoggedIn: true,
            user: user,
            returnUrl: this.intendedRoute // Pass back the intended route
          });
        } else {
          // If it's a standalone page, navigate to the intended route or fallback
          const navigateTo = this.intendedRoute || '/';
          this.router.navigateByUrl(navigateTo);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.registerForm.enable();
        console.error('Registration failed', err);
        this.errorMessage = err.message || err.error?.message || this.translate.instant('auth.registrationFailed');
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

import {Component, Inject, OnInit, Optional} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {Router} from '@angular/router';
import {NgIf} from '@angular/common';
import {AuthService} from '../../../../core/services/auth.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {ResetPasswordComponent} from '../reset-password/reset-password.component';
import {ForgotPasswordComponent} from '../forgot-password/forgot-password.component';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {RegisterComponent} from '../register/register.component';

@UntilDestroy()
@Component({
  selector: 'app-login',
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    MatFormFieldModule, // Add MatFormFieldModule
    MatInputModule,     // Add MatInputModule
    MatButtonModule,    // Add MatButtonModule
    MatIconModule,      // Add MatIconModule
    NgIf,
    MatDialogModule, // Ensure MatDialogModule is here if LoginComponent itself can open dialogs
    MatSnackBarModule // For success messages
  ],
  templateUrl: './login.component.html',
  standalone: true,
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword = true;
  isDialog: boolean = false;
  intendedRoute?: string;
  preambleMessage?: string;
  loginError: string | null = null;
  currentLang!:string
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService, // Inject AuthService
    private router: Router,
    private translate: TranslateService, // Inject TranslateService
    private dialog: MatDialog, // Inject MatDialog
    private snackBar: MatSnackBar, // Inject MatSnackBar
    @Optional() public dialogRef?: MatDialogRef<LoginComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: {
      intendedRoute?: string,
      source?: string,
      preambleMessage?: string
    }) {
      if (this.dialogRef && this.data) { // Check data as well
        this.isDialog = true;
        this.intendedRoute = this.data.intendedRoute;
        if (this.data.preambleMessage) {
          this.preambleMessage = this.data.preambleMessage;
        }
      }
    }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      user_name: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    this.currentLang = this.translate.currentLang
    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe((event) => {
      this.currentLang = event.lang
    })
  }

  submitLogin(): void {
    this.loginError = null; // Reset error
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.loginForm.disable();

    this.authService.login(this.loginForm.value).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.loginForm.enable();
        if (this.isDialog && this.dialogRef) {
          this.dialogRef.close({ loggedIn: true, returnUrl: this.intendedRoute });
        } else {
          const returnUrlFromState = this.router.lastSuccessfulNavigation?.extractedUrl.queryParams['returnUrl'];
          const returnUrlFromParams = this.router.routerState.snapshot.root.queryParams['returnUrl'];
          const returnUrl = returnUrlFromState || returnUrlFromParams || '/';
          this.router.navigateByUrl(returnUrl);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.loginForm.enable();
        console.error('Login failed', err);
        this.loginError = err.message || this.translate.instant('auth.loginFailed');
      }
    });
  }

  navigateToRegister(): void {
    // If this LoginComponent is already a dialog, close it first
    if (this.isDialog && this.dialogRef) {
      this.dialogRef.close({ action: 'openRegisterDialog' }); // Signal the parent to open register
    } else {
      // If LoginComponent is a standalone page, open the register dialog directly
      const registerDialogRef = this.dialog.open(RegisterComponent, {
        width: '450px', // Adjust size as needed
        maxWidth: '90vw',
        disableClose: true // Prevent closing by clicking outside or ESC
      });

      registerDialogRef.afterClosed().subscribe(result => {
        if (result?.registered) {
          // Registration successful, show success message and potentially open login again
          this.snackBar.open(this.translate.instant('auth.registrationSuccessMessage'), this.translate.instant('common.dismiss'), { duration: 5000 });
          // Optionally, re-open the login dialog or navigate to login page
          // If it was a page, maybe just clear the form or stay on the page
          // If it was a dialog opened from somewhere else (like Navbar), that component
          // would handle re-opening the login dialog based on the 'action' result.
          // Since we closed the login dialog above if it was a dialog,
          // the component that opened the *original* login dialog needs to handle this.
          // However, if LoginComponent was a page, we might want to open the login dialog here:
          if (!this.isDialog) { // If LoginComponent was a page
            this.dialog.open(LoginComponent, {
              width: '450px',
              maxWidth: '90vw',
              data: {
                preambleMessage: this.translate.instant('auth.registrationSuccessLoginPrompt')
              }
            });
          }
        } else if (result?.action === 'backToLogin') {
          // User clicked "Back to Login" in the register dialog
          // If LoginComponent was a page, open the login dialog
          if (!this.isDialog) {
            this.dialog.open(LoginComponent, {
              width: '450px',
              maxWidth: '90vw',
              data: {
                preambleMessage: this.translate.instant('auth.welcomeBackLoginPrompt') // Optional message
              }
            });
          }
          // If LoginComponent was already a dialog, the parent (e.g., Navbar)
          // would handle re-opening it based on the 'action' result.
          // We already closed the login dialog if it was a dialog, so the parent
          // needs to catch the 'openRegisterDialog' action and then potentially
          // catch the 'backToLogin' action from the register dialog.
          // This suggests a slightly different flow: if LoginComponent is a dialog,
          // it should *not* open the Register dialog itself, but rather close
          // and signal the parent to open the Register dialog.
          // Let's refine this logic.
        }
      });
    }
  }

  openRegisterDialog(): void {
    // If this LoginComponent is already a dialog, close it and signal the parent
    if (this.isDialog && this.dialogRef) {
      this.dialogRef.close({ action: 'openRegisterDialog', intendedRoute: this.intendedRoute });
    } else {
      // If LoginComponent is a standalone page, open the register dialog directly
      const registerDialogRef = this.dialog.open(RegisterComponent, {
        width: '450px', // Adjust size as needed
        maxWidth: '90vw',
        // disableClose: true // Prevent closing by clicking outside or ESC
      });

      registerDialogRef.afterClosed().subscribe(result => {
        if (result?.registered) {
          this.snackBar.open(this.translate.instant('auth.registrationSuccessMessage'), this.translate.instant('common.dismiss'), { duration: 5000 });
          // If it was a page, open login dialog after successful registration
          this.dialog.open(LoginComponent, {
            width: '450px',
            maxWidth: '90vw',
            data: {
              preambleMessage: this.translate.instant('auth.registrationSuccessLoginPrompt')
            }
          });
        } else if (result?.action === 'backToLogin') {
          // If it was a page, open login dialog if user wants to go back
          this.dialog.open(LoginComponent, {
            width: '450px',
            maxWidth: '90vw',
            data: {
              preambleMessage: this.translate.instant('auth.welcomeBackLoginPrompt')
            }
          });
        }
      });
    }
  }

  navigateToForgotPassword(): void {
    // If this LoginComponent is already a dialog, close it and signal the parent
    if (this.isDialog && this.dialogRef) {
      this.dialogRef.close({ action: 'openForgotPasswordDialog', intendedRoute: this.intendedRoute });
    } else {
      // If LoginComponent is a standalone page, open the forgot password dialog directly
      const forgotPasswordDialogRef = this.dialog.open(ForgotPasswordComponent, {
        width: '400px',
        maxWidth: '90vw',
        // disableClose: true
      });

      forgotPasswordDialogRef.afterClosed().subscribe(fpResult => {
        if (fpResult?.emailSent && fpResult?.email) {
          const resetPasswordDialogRef = this.dialog.open(ResetPasswordComponent, {
            width: '450px',
            maxWidth: '90vw',
            // disableClose: true,
            data: { email: fpResult.email }
          });

          resetPasswordDialogRef.afterClosed().subscribe(rpResult => {
            if (rpResult?.passwordReset) {
              this.snackBar.open(this.translate.instant('auth.passwordResetSuccessMessage'), this.translate.instant('common.dismiss'), { duration: 5000 });
              // After password reset, open the Login dialog again
              this.dialog.open(LoginComponent, {
                width: '450px',
                maxWidth: '90vw',
                data: {
                  preambleMessage: this.translate.instant('auth.passwordResetSuccessLoginPrompt')
                }
              });
            }
          });
        }
      });
    }
  }
}

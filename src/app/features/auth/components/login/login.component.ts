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
import {User} from '../../models/user';

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
    if (this.dialogRef) { // Simplified check: if dialogRef exists, it's a dialog
      this.isDialog = true;
      if (this.data) { // Check if data exists before accessing its properties
        this.intendedRoute = this.data.intendedRoute;
        if (this.data.preambleMessage) {
          this.preambleMessage = this.data.preambleMessage;
        }
      }
    }
    }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    this.currentLang = this.translate.currentLang
    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe((event) => {
      this.currentLang = event.lang
    })
  }

  submitLogin(): void {
    this.loginError = null;
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.loginForm.disable();

    this.authService.login(this.loginForm.value).subscribe({
      next: (user: User | null) => { // <--- user can now be User or null
        this.isLoading = false;
        this.loginForm.enable();

        // Display success snackbar
        const successMessage = this.translate.instant('auth.loginSuccessMessage');
        const dismissAction = this.translate.instant('common.dismiss'); // Assuming you have a common.dismiss key
        this.snackBar.open(successMessage, dismissAction, {
          duration: 3000, // Duration in milliseconds
          horizontalPosition: 'center', // Optional: 'start' | 'center' | 'end' | 'left' | 'right'
          verticalPosition: 'bottom', // Optional: 'top' | 'bottom'
        });

        // Navigation logic proceeds even if user is null, as long as the observable completes.
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

  // navigateToRegister(): void {
  //   // If this LoginComponent is already a dialog, close it first
  //   if (this.isDialog && this.dialogRef) {
  //     this.dialogRef.close({ action: 'openRegisterDialog' }); // Signal the parent to open register
  //   } else {
  //     // If LoginComponent is a standalone page, open the register dialog directly
  //     const registerDialogRef = this.dialog.open(RegisterComponent, {
  //       width: '450px', // Adjust size as needed
  //       maxWidth: '90vw',
  //       disableClose: true // Prevent closing by clicking outside or ESC
  //     });
  //
  //     registerDialogRef.afterClosed().subscribe(result => {
  //       if (result?.registered) {
  //         // Registration successful, show success message and potentially open login again
  //         this.snackBar.open(this.translate.instant('auth.registrationSuccessMessage'), this.translate.instant('common.dismiss'), { duration: 5000 });
  //         if (!this.isDialog) { // If LoginComponent was a page
  //           this.dialog.open(LoginComponent, {
  //             width: '450px',
  //             maxWidth: '90vw',
  //             data: {
  //               preambleMessage: this.translate.instant('auth.registrationSuccessLoginPrompt')
  //             }
  //           });
  //         }
  //       } else if (result?.action === 'backToLogin') {
  //         // User clicked "Back to Login" in the register dialog
  //         // If LoginComponent was a page, open the login dialog
  //         if (!this.isDialog) {
  //           this.dialog.open(LoginComponent, {
  //             width: '450px',
  //             maxWidth: '90vw',
  //             data: {
  //               preambleMessage: this.translate.instant('auth.welcomeBackLoginPrompt') // Optional message
  //             }
  //           });
  //         }
  //         // If LoginComponent was already a dialog, the parent (e.g., Navbar)
  //         // would handle re-opening it based on the 'action' result.
  //         // We already closed the login dialog if it was a dialog, so the parent
  //         // needs to catch the 'openRegisterDialog' action and then potentially
  //         // catch the 'backToLogin' action from the register dialog.
  //         // This suggests a slightly different flow: if LoginComponent is a dialog,
  //         // it should *not* open the Register dialog itself, but rather close
  //         // and signal the parent to open the Register dialog.
  //         // Let's refine this logic.
  //       }
  //     });
  //   }
  // }

  openRegisterDialog(): void {
    if (this.isDialog && this.dialogRef) {
      // If LoginComponent is a dialog, close it and signal the parent component
      // to open the Register dialog, passing along the intendedRoute.
      this.dialogRef.close({ action: 'openRegisterDialog', intendedRoute: this.intendedRoute });
    } else {
      // If LoginComponent is a standalone page, open the RegisterComponent dialog directly.
      // Determine the intendedRoute: use LoginComponent's own intendedRoute if set (e.g., from its own MAT_DIALOG_DATA if it was opened as a dialog for some reason, though less common for a page),
      // or from current route query params, or fallback to '/'.
      const routeForRegister = this.intendedRoute || this.router.routerState.snapshot.root.queryParams['returnUrl'] || '/';

      const registerDialogRef = this.dialog.open(RegisterComponent, {
        width: '450px',
        maxWidth: '90vw',
        data: { intendedRoute: routeForRegister } // Pass the intendedRoute to RegisterComponent
      });

      registerDialogRef.afterClosed().subscribe(result => {
        if (result?.registeredAndLoggedIn && result?.returnUrl) {
          // Registration was successful, user is logged in, and RegisterComponent provided a returnUrl.
          this.router.navigateByUrl(result.returnUrl);
        } else if (result?.registeredAndLoggedIn) {
          // Fallback if returnUrl wasn't provided for some reason, though it should be.
          this.router.navigate(['/']);
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

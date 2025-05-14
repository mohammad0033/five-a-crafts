import { Component } from '@angular/core';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {AuthService} from '../../../core/services/auth.service';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-auth-dialog',
  imports: [
    TranslatePipe,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButton
  ],
  templateUrl: './auth-dialog.component.html',
  standalone: true,
  styleUrl: './auth-dialog.component.scss'
})
export class AuthDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AuthDialogComponent>,
    private mockAuthService: AuthService,
    private translate: TranslateService // Inject TranslateService if you use the pipe in the template
  ) {}

  onLogin(): void {
    this.mockAuthService.login();
    this.dialogRef.close(true); // Close dialog and indicate success
  }

  onRegister(): void {
    this.mockAuthService.register();
    this.dialogRef.close(true); // Close dialog and indicate success
  }

  onCancel(): void {
    this.dialogRef.close(false); // Close dialog and indicate cancellation
  }
}

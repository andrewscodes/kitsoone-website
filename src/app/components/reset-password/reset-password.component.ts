import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../service/auth.service';
import { RequiredLabelDirective } from '../../directives/required-label.directive';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'kitsoone-reset-password',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    FloatLabelModule,
    PasswordModule,
    ToastModule,
    RequiredLabelDirective,
  ],
  providers: [MessageService],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  private email = '';
  private code = '';
  public newPassword = '';
  public confirmPassword = '';
  public submitAttempted = signal(false);
  public submitting = signal(false);
  // Reset only happens via the emailed link, so a missing email/code means an invalid or expired link.
  public invalidLink = signal(false);

  public ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.email = params['email'] ?? '';
    this.code = params['code'] ?? '';
    this.invalidLink.set(!this.email || !this.code);
  }

  public onSubmit(form: NgForm): void {
    this.submitAttempted.set(true);

    if (!this.newPassword || !this.confirmPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Todos los campos son obligatorios.',
      });
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Las contraseñas no coinciden.',
      });
      return;
    }

    if (this.newPassword.length < 8) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La contraseña debe tener al menos 8 caracteres.',
      });
      return;
    }

    if (form.invalid) {
      return;
    }

    this.submitting.set(true);

    this.authService
      .confirmResetPassword(this.email, this.code, this.newPassword)
      .then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Contraseña actualizada',
          detail:
            'Tu contraseña ha sido restablecida. Ya puedes iniciar sesión.',
        });
        setTimeout(() => this.router.navigate(['/login']), 1500);
      })
      .catch((error) => {
        this.submitting.set(false);
        const err = error as { name?: string };

        // The code is single-use and short-lived, so treat either as a dead link rather than a retryable form error.
        if (
          err.name === 'CodeMismatchException' ||
          err.name === 'ExpiredCodeException'
        ) {
          this.invalidLink.set(true);
          return;
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ocurrió un error. Intenta de nuevo.',
        });
      });
  }
}

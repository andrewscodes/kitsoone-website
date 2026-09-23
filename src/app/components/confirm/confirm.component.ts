import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../service/auth.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'kitsoone-confirm',
  standalone: true,
  imports: [RouterModule, ToastModule],
  providers: [MessageService],
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.scss',
})
export class ConfirmComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  public email = '';
  public resending = signal(false);

  public ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.email = params['email'] ?? '';
    const code = params['code'];

    // Link from the confirmation email includes the code, so confirm right away in the background.
    if (this.email && code) {
      this.confirmAccount(this.email, code);
    }
  }

  public resendConfirmationEmail(): void {
    if (!this.email || this.resending()) return;

    this.resending.set(true);

    this.authService
      .resendSignUp(this.email)
      .then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Correo reenviado',
          detail: 'Revisa tu bandeja de entrada.',
        });
      })
      .catch(() => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo reenviar el correo. Intenta de nuevo.',
        });
      })
      .finally(() => this.resending.set(false));
  }

  private confirmAccount(email: string, code: string): void {
    this.authService
      .confirmSignUp(email, code)
      .then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Cuenta confirmada',
          detail: 'Tu cuenta ha sido verificada. Ya puedes iniciar sesión.',
        });
        setTimeout(() => this.router.navigate(['/login']), 1500);
      })
      .catch((error) => {
        const err = error as { name?: string };
        const message =
          err.name === 'CodeMismatchException' ||
          err.name === 'ExpiredCodeException'
            ? 'El enlace de confirmación es inválido o expiró. Solicita uno nuevo.'
            : 'Ocurrió un error. Intenta de nuevo.';
        this.messageService.add({
          severity: 'error',
          summary: 'Error al confirmar',
          detail: message,
        });
      });
  }
}

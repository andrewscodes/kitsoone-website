import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../service/auth.service';
import { KitsooneApiService } from '../../service/kitsoone-api.service';
import { RequiredLabelDirective } from '../../directives/required-label.directive';
import { EmailValidDirective } from '../../directives/email-valid.directive';
import { EmailValidationToastDirective } from '../../directives/email-validation-toast.directive';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'kitsoone-login',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    FloatLabelModule,
    InputTextModule,
    PasswordModule,
    ToastModule,
    RequiredLabelDirective,
    EmailValidDirective,
    EmailValidationToastDirective,
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly apiService = inject(KitsooneApiService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  public email = '';
  public password = '';
  public submitAttempted = signal(false);
  public submitting = signal(false);

  public onSubmit(form: NgForm): void {
    this.submitAttempted.set(true);

    if (form.controls['email']?.invalid) {
      return;
    }

    if (!this.password.trim() || form.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Ingresa tu correo electrónico y contraseña.',
      });
      return;
    }

    this.submitting.set(true);

    this.authService
      .signIn(this.email, this.password)
      .then(() => {
        const pending = sessionStorage.getItem('pendingProfile');
        if (pending) {
          sessionStorage.removeItem('pendingProfile');
          const { name, dateOfBirth } = JSON.parse(pending) as {
            name: string;
            dateOfBirth: string;
          };
          this.apiService
            .saveProfile(name, dateOfBirth, this.email)
            .subscribe();
        }
        this.router.navigate(['/']);
      })
      .catch((error) => {
        this.submitting.set(false);
        const err = error as { name?: string };
        const message = this.getErrorMessage(error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error al iniciar sesión',
          detail: message,
        });

        if (err.name === 'UserNotConfirmedException') {
          this.router.navigate(['/confirm'], {
            queryParams: { email: this.email },
          });
        }
      });
  }

  private getErrorMessage(error: unknown): string {
    const err = error as { name?: string };
    switch (err.name) {
      case 'NotAuthorizedException':
        return 'Correo o contraseña incorrectos.';
      case 'UserNotConfirmedException':
        return 'Tu cuenta no ha sido confirmada. Revisa tu correo electrónico.';
      case 'UserNotFoundException':
        return 'No existe una cuenta con este correo.';
      default:
        return 'Ocurrió un error. Intenta de nuevo.';
    }
  }
}

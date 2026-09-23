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
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../service/auth.service';
import { KitsooneApiService } from '../../service/kitsoone-api.service';
import { RequiredLabelDirective } from '../../directives/required-label.directive';
import { EmailValidDirective } from '../../directives/email-valid.directive';
import { EmailValidationToastDirective } from '../../directives/email-validation-toast.directive';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'kitsoone-signup',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    FloatLabelModule,
    InputTextModule,
    PasswordModule,
    DatePickerModule,
    ToastModule,
    RequiredLabelDirective,
    EmailValidDirective,
    EmailValidationToastDirective,
  ],
  providers: [MessageService],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  private readonly authService = inject(AuthService);
  private readonly apiService = inject(KitsooneApiService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  public readonly today = new Date();

  public email = '';
  public name = '';
  public dateOfBirth = '';
  public dateOfBirthValue: Date | null = null;
  public password = '';
  public confirmPassword = '';
  public submitAttempted = signal(false);
  public submitting = signal(false);

  public onDateOfBirthChange(date: Date | null): void {
    this.dateOfBirthValue = date;
    this.dateOfBirth = date ? this.formatDateForApi(date) : '';
  }

  private formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  public onSubmit(form: NgForm): void {
    this.submitAttempted.set(true);

    if (form.controls['email']?.invalid) {
      return;
    }

    if (
      !this.name.trim() ||
      !this.dateOfBirth ||
      !this.password ||
      !this.confirmPassword
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Todos los campos son obligatorios.',
      });
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Las contraseñas no coinciden.',
      });
      return;
    }

    if (this.password.length < 8) {
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
      .signUp(this.email, this.password)
      .then((cognitoSub) => {
        sessionStorage.setItem(
          'pendingProfile',
          JSON.stringify({ name: this.name, dateOfBirth: this.dateOfBirth }),
        );

        // Best-effort: create the DB row now so the account exists even if confirmation is abandoned.
        // The confirm/login flow retries this (idempotent upsert) if it fails here.
        this.apiService
          .registerProfile(cognitoSub, this.name, this.email, this.dateOfBirth)
          .subscribe({
            error: (error) =>
              console.error(
                'Failed to pre-register profile, will retry later:',
                error,
              ),
          });

        this.router.navigate(['/confirm'], {
          queryParams: { email: this.email },
        });
      })
      .catch((error) => {
        this.submitting.set(false);
        console.error('Signup error:', error);
        const message = this.getErrorMessage(error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error al crear cuenta',
          detail: message,
        });
      });
  }

  private getErrorMessage(error: unknown): string {
    const err = error as { name?: string };
    switch (err.name) {
      case 'UsernameExistsException':
        return 'Ya existe una cuenta con este correo electrónico.';
      case 'InvalidPasswordException':
        return 'La contraseña no cumple los requisitos. Usa mayúsculas, minúsculas, números y símbolos.';
      default:
        return 'Ocurrió un error. Intenta de nuevo.';
    }
  }
}

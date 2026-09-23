import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../service/auth.service';
import { RequiredLabelDirective } from '../../directives/required-label.directive';
import { EmailValidDirective } from '../../directives/email-valid.directive';
import { EmailValidationToastDirective } from '../../directives/email-validation-toast.directive';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'kitsoone-forgot-password',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    FloatLabelModule,
    InputTextModule,
    ToastModule,
    RequiredLabelDirective,
    EmailValidDirective,
    EmailValidationToastDirective,
  ],
  providers: [MessageService],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  public email = '';
  public submitAttempted = signal(false);
  public submitting = signal(false);
  public emailSent = signal(false);

  public onSubmit(form: NgForm): void {
    this.submitAttempted.set(true);

    if (form.invalid) {
      return;
    }

    this.submitting.set(true);

    this.authService
      .forgotPassword(this.email)
      .then(() => {
        this.submitting.set(false);
        this.emailSent.set(true);
      })
      .catch(() => {
        this.submitting.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail:
            'No se pudo enviar el código. Verifica tu correo e intenta de nuevo.',
        });
      });
  }
}

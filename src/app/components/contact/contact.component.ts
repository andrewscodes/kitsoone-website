import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import emailjs from '@emailjs/browser';
import { EmailValidPipe } from '../../pipes/email-valid.pipe';

const EMAILJS_SERVICE_ID = 'service_3ljbvjz';
const EMAILJS_TEMPLATE_ID = 'template_udznwss';
const EMAILJS_PUBLIC_KEY = 'DbinEYxWM9oV4WTao';
const NAME_LIMIT = 50;
const EMAIL_LIMIT = 100;
const COMMENT_LIMIT = 1000;
const NAME_MAX_LENGTH = NAME_LIMIT - 1;
const EMAIL_MAX_LENGTH = EMAIL_LIMIT - 1;
const COMMENT_MAX_LENGTH = COMMENT_LIMIT - 1;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'kitsoone-contact',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    FloatLabelModule,
    InputTextModule,
    TextareaModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  private readonly emailValidPipe = new EmailValidPipe();
  private readonly messageService = inject(MessageService);

  public readonly nameMaxLength = NAME_MAX_LENGTH;
  public readonly emailMaxLength = EMAIL_MAX_LENGTH;
  public readonly commentMaxLength = COMMENT_MAX_LENGTH;
  public name = '';
  public email = '';
  public comment = '';
  public submitAttempted = signal(false);
  public submitting = signal(false);

  public isValidEmail(value: string | null | undefined): boolean {
    return this.emailValidPipe.transform(value);
  }

  public onSubmit(form: NgForm): void {
    this.submitAttempted.set(true);

    const isNameValid = this.name.trim().length > 0;
    const isNameLengthValid = this.name.length <= NAME_MAX_LENGTH;
    const isEmailNotEmpty = this.email.trim().length > 0;
    const isEmailLengthValid = this.email.length <= EMAIL_MAX_LENGTH;
    const isEmailValid = this.emailValidPipe.transform(this.email);
    const isCommentValid = this.comment.trim().length > 0;
    const isCommentLengthValid = this.comment.length <= COMMENT_MAX_LENGTH;

    if (
      !isNameValid ||
      !isNameLengthValid ||
      !isEmailNotEmpty ||
      !isEmailLengthValid ||
      !isEmailValid ||
      !isCommentValid ||
      !isCommentLengthValid ||
      form.invalid
    ) {
      this.messageService.clear();

      if (!isNameValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Nombre invalido',
          detail: 'El nombre es obligatorio.',
        });
      } else if (!isNameLengthValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Nombre invalido',
          detail: `El nombre debe tener menos de ${NAME_LIMIT} caracteres.`,
        });
      }

      if (!isEmailNotEmpty) {
        this.messageService.add({
          severity: 'error',
          summary: 'Correo invalido',
          detail: 'El correo electronico es obligatorio.',
        });
      } else if (!isEmailLengthValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Correo invalido',
          detail: `El correo electronico debe tener menos de ${EMAIL_LIMIT} caracteres.`,
        });
      } else if (!isEmailValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Correo invalido',
          detail: 'Ingresa un correo electronico valido.',
        });
      }

      if (!isCommentValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Comentario invalido',
          detail: 'El comentario es obligatorio.',
        });
      } else if (!isCommentLengthValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Comentario invalido',
          detail: `El comentario debe tener menos de ${COMMENT_LIMIT} caracteres.`,
        });
      }

      return;
    }

    this.submitting.set(true);

    emailjs
      .send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        { name: this.name, email: this.email, message: this.comment },
        EMAILJS_PUBLIC_KEY,
      )
      .then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Mensaje enviado',
          detail:
            'Gracias por contactarnos. Te responderemos lo antes posible.',
        });
        this.name = '';
        this.email = '';
        this.comment = '';
        this.submitAttempted.set(false);
        this.submitting.set(false);
        form.resetForm();
      })
      .catch(() => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error al enviar',
          detail: 'No se pudo enviar el mensaje. Intenta de nuevo más tarde.',
        });
        this.submitting.set(false);
      });
  }
}

import { Directive, HostListener, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { EmailValidPipe } from '../pipes/email-valid.pipe';

@Directive({
  selector: 'form[emailValidationToast]',
  standalone: true,
})
export class EmailValidationToastDirective {
  private readonly form = inject(NgForm);
  private readonly messageService = inject(MessageService);
  private readonly emailValidPipe = new EmailValidPipe();

  @HostListener('submit', ['$event'])
  public validateEmail(event: Event): void {
    const emailControl = this.form.controls['email'];
    if (!emailControl) return;

    const email = String(emailControl.value ?? '');
    const isEmailNotEmpty = email.trim().length > 0;
    const isEmailLengthValid = email.length <= 100;
    const isEmailValid = this.emailValidPipe.transform(email);

    if (isEmailNotEmpty && isEmailLengthValid && isEmailValid) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: !isEmailNotEmpty
        ? 'Ingresa tu correo electrónico.'
        : !isEmailLengthValid
          ? 'El correo electrónico no puede superar los 100 caracteres.'
          : 'Ingresa un correo electrónico válido.',
    });
  }
}
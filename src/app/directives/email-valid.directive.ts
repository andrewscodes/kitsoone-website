import { Directive, forwardRef } from '@angular/core';
import {
  AbstractControl,
  NG_VALIDATORS,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { EmailValidPipe } from '../pipes/email-valid.pipe';

@Directive({
  selector: '[emailValid]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => EmailValidDirective),
      multi: true,
    },
  ],
})
export class EmailValidDirective implements Validator {
  private readonly emailValidPipe = new EmailValidPipe();

  public validate(control: AbstractControl): ValidationErrors | null {
    return this.emailValidPipe.transform(control.value)
      ? null
      : { emailValid: true };
  }
}
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = 'service_3ljbvjz';
const EMAILJS_TEMPLATE_ID = 'template_udznwss';
const EMAILJS_PUBLIC_KEY = 'DbinEYxWM9oV4WTao';

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
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  public name = '';
  public email = '';
  public comment = '';
  public submitting = signal(false);
  public statusMessage = signal<string | null>(null);
  public isError = signal(false);

  public onSubmit(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.statusMessage.set(null);

    emailjs
      .send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        { name: this.name, email: this.email, message: this.comment },
        EMAILJS_PUBLIC_KEY,
      )
      .then(() => {
        this.isError.set(false);
        this.statusMessage.set(
          'Gracias por contactarnos. Te responderemos lo antes posible.',
        );
        this.name = '';
        this.email = '';
        this.comment = '';
        this.submitting.set(false);
        form.resetForm();
      })
      .catch(() => {
        this.isError.set(true);
        this.statusMessage.set(
          'No se pudo enviar el mensaje. Intenta de nuevo más tarde.',
        );
        this.submitting.set(false);
      });
  }
}

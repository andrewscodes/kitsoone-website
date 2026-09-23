import { Directive } from '@angular/core';

@Directive({
  selector: 'label[required]',
  standalone: true,
  host: { class: 'required-label' },
})
export class RequiredLabelDirective {}
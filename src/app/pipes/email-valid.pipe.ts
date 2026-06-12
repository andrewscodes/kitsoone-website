import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'emailValid',
  standalone: true,
})
export class EmailValidPipe implements PipeTransform {
  public transform(value: string | null | undefined): boolean {
    const normalizedValue = value?.trim() ?? '';

    if (!normalizedValue) {
      return false;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizedValue);
  }
}

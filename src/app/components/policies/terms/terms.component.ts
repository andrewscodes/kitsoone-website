import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'kitsoone-terms',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.scss',
})
export class TermsOfServiceComponent {}

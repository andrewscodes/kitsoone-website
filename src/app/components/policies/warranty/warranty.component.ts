import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'kitsoone-warranty',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './warranty.component.html',
  styleUrl: './warranty.component.scss',
})
export class WarrantyComponent {}

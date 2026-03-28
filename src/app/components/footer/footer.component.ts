import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  FACEBOOK_URL,
  INSTAGRAM_URL,
  DISCORD_URL,
  generateWhatsAppUrl,
} from '../../constants';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'kitsoone-footer',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  // Social media URLs
  public readonly facebookUrl = FACEBOOK_URL;
  public readonly instagramUrl = INSTAGRAM_URL;
  public readonly discordUrl = DISCORD_URL;
  public currentYear = new Date().getFullYear();

  public get whatsappUrl(): string {
    return generateWhatsAppUrl();
  }
}

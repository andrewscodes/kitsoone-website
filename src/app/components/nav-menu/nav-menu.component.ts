import {
  Component,
  inject,
  Renderer2,
  Inject,
  DOCUMENT,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import {
  FACEBOOK_URL,
  INSTAGRAM_URL,
  DISCORD_URL,
  GITHUB_URL,
  generateWhatsAppUrl,
} from '../../constants';
import { CartService } from '../../service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'kitsoone-nav-menu',
  standalone: true,
  imports: [RouterModule, AsyncPipe, OverlayBadgeModule],
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss'],
})
export class NavMenuComponent {
  protected readonly cartItemCount$ = inject(CartService).itemCount$;
  protected isSidebarMenuOpen = false;

  // Social media URLs
  public readonly facebookUrl = FACEBOOK_URL;
  public readonly instagramUrl = INSTAGRAM_URL;
  public readonly discordUrl = DISCORD_URL;
  public readonly githubUrl = GITHUB_URL;

  public get whatsappUrl(): string {
    return generateWhatsAppUrl();
  }

  constructor(
    private router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  protected toggleMenu(): void {
    this.isSidebarMenuOpen = !this.isSidebarMenuOpen;
    this.toggleBodyScroll();
  }

  protected onMenuItemClick(): void {
    this.isSidebarMenuOpen = false;
    this.toggleBodyScroll();
  }

  protected toggleBodyScroll(): void {
    if (this.isSidebarMenuOpen) {
      this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
    } else {
      this.renderer.removeStyle(this.document.body, 'overflow');
    }
  }

  protected onCartClick(): void {
    this.router.navigate(['/cart']);
  }

  public onLogoClick(): void {
    this.router.navigate(['/']);
  }

  protected onAboutClick(): void {
    this.router.navigate(['/acerca']);
    this.onMenuItemClick();
  }

  protected onProductsItemClick(): void {
    this.router.navigate(['/productos']);
    this.onMenuItemClick();
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/theme/theme.service';
import { LayoutService } from '../../core/layout/layout.service';

@Component({
  imports: [],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar implements OnInit {
  protected readonly authService = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  protected readonly layout = inject(LayoutService);

  ngOnInit() {
    this.authService.hydrate();
  }

  logout() {
    this.authService.logout();
  }
}
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/theme/theme.service';

@Component({
  imports: [],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar implements OnInit {
  protected readonly authService = inject(AuthService);
  protected readonly theme = inject(ThemeService);

  ngOnInit() {
    this.authService.hydrate();
  }

  logout() {
    this.authService.logout();
  }
}
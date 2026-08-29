import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  imports: [],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar implements OnInit {
  protected readonly authService = inject(AuthService);

  ngOnInit() {
    this.authService.hydrate();
  }

  logout() {
    this.authService.logout();
  }
}
import { Component, inject } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { Sidebar } from '../sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
import { LayoutService } from '../../core/layout/layout.service';

@Component({
  imports: [Navbar, Sidebar, RouterOutlet],
  selector: 'app-admin-layout',
  styleUrl: './admin-layout.css',
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  protected readonly layout = inject(LayoutService);
}

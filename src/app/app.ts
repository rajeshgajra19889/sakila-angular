import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainer } from './core/toast/toast-container';
import { ConfirmDialog } from './core/confirm/confirm-dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainer, ConfirmDialog],
  template: '<router-outlet /><app-toast-container /><app-confirm-dialog />'
})
export class App { }
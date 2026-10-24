import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CommonModule],
  template: `
    <div class="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden">
      <app-header *ngIf="!isAdminRoute"></app-header>
      <main class="flex-1 w-full max-w-full overflow-x-hidden">
        <router-outlet></router-outlet>
      </main>
      <app-footer *ngIf="!isAdminRoute"></app-footer>
    </div>
  `
})
export class App {
  constructor(public router: Router) {}

  get isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }
}

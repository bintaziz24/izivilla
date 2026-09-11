import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden">
      <app-header></app-header>
      <main class="flex-1 w-full max-w-full overflow-x-hidden">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
    </div>
  `

})
export class App {}

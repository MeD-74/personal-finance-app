import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Sidebar } from './core/components/sidebar/sidebar';
import { filter } from 'rxjs';
import { NgClass } from '@angular/common';
import { SettingsService } from './core/services/settings';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Sidebar, NgClass, TranslateModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  title = 'personal-finance-app';
  router = inject(Router);
  settings = inject(SettingsService); 

  isAuthPage = false;
  isSidebarMinimized = false;

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isAuthPage = event.url.includes('/login') || event.url.includes('/signup');
      });
  }
}

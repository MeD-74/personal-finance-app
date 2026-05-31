import { Component, inject, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { Sidebar } from './core/components/sidebar/sidebar';
import { SettingsService } from './core/services/settings';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Sidebar, CommonModule, TranslateModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App implements OnInit {
  private router = inject(Router);

  settings = inject(SettingsService);

  showSidebar = true;
  isSidebarMinimized = false;

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const currentUrl = event.urlAfterRedirects || event.url;
        this.showSidebar = !currentUrl.includes('/login') && !currentUrl.includes('/signup');
      });
  }
}

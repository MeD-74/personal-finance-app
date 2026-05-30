import { Component, EventEmitter, Output, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';
import { SettingsService } from '../../services/settings';
import { TranslateModule } from '@ngx-translate/core'; 

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass, TranslateModule], 
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
})
export class Sidebar {
  @Output() toggle = new EventEmitter<boolean>();
  isMinimized = false;
  settings = inject(SettingsService);
  isLangDropdownOpen = false;

  navItems = [
    { name: 'Overview', path: '/overview', icon: 'icon-nav-overview.svg' },
    { name: 'Transactions', path: '/transactions', icon: 'icon-nav-transactions.svg' },
    { name: 'Budgets', path: '/budgets', icon: 'icon-nav-budgets.svg' },
    { name: 'Pots', path: '/pots', icon: 'icon-nav-pots.svg' },
    { name: 'Recurring Bills', path: '/recurring', icon: 'icon-nav-recurring-bills.svg' },
  ];

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    this.toggle.emit(this.isMinimized);
  }
}

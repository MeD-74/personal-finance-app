import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CurrencyPipe, DatePipe, SlicePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FinanceService, Budget, Transaction } from '../../core/services/finance';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsService } from '../../core/services/settings';

export interface BudgetDetail extends Budget {
  spent: number;
  remaining: number;
  latestTxs: Transaction[];
}

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, SlicePipe, NgClass, RouterLink, FormsModule, TranslateModule],
  templateUrl: './budgets.html',
  styleUrls: ['./budgets.scss'],
})
export class Budgets implements OnInit {
  financeService = inject(FinanceService);
  cdr = inject(ChangeDetectorRef);
  settings = inject(SettingsService);

  budgets: BudgetDetail[] = [];
  transactions: Transaction[] = [];
  totalLimit = 0;
  totalSpent = 0;

  categories = [
    'Entertainment',
    'Bills',
    'Groceries',
    'Dining Out',
    'Transportation',
    'Personal Care',
    'Education',
    'Lifestyle',
    'Shopping',
    'General',
  ];
  themeColors = [
    { name: 'Green', hex: '#277c78' },
    { name: 'Yellow', hex: '#f2cdac' },
    { name: 'Cyan', hex: '#82c9d7' },
    { name: 'Navy', hex: '#626070' },
    { name: 'Red', hex: '#c94736' },
    { name: 'Purple', hex: '#826cb0' },
  ];

  isModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;

  // Custom Dropdowns
  isAddCategoryDropdownOpen = false;
  isAddThemeDropdownOpen = false;
  isEditCategoryDropdownOpen = false;
  isEditThemeDropdownOpen = false;

  newBudget: Partial<Budget> = {
    category: '',
    maximum: null as any,
    theme: '',
  };

  activeDropdown: string | number | null = null;
  selectedBudget: Budget | null = null;
  errorModalMessage: string | null = null;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.financeService.getTransactions().subscribe((txs) => {
      this.transactions = txs;
      this.financeService.getBudgets().subscribe((bds) => {
        this.processBudgets(bds, txs);
        this.cdr.detectChanges();
      });
    });
  }

  processBudgets(bds: Budget[], txs: Transaction[]) {
    this.totalLimit = 0;
    this.totalSpent = 0;

    this.budgets = bds.map((budget) => {
      const catTxs = txs.filter((t) => t.category === budget.category);
      const spent = Math.abs(
        catTxs.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0),
      );
      const remaining = budget.maximum - spent;

      this.totalLimit += budget.maximum;
      this.totalSpent += spent;

      const latestTxs = catTxs
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);
      return { ...budget, spent, remaining, latestTxs };
    });
  }

  getBudgetGradient(): string {
    if (!this.budgets.length || this.totalLimit === 0) return 'conic-gradient(#f8f4f0 0% 100%)';
    let gradient = 'conic-gradient(';
    let currentPercent = 0;
    this.budgets.forEach((budget, index) => {
      let percent = (budget.maximum / this.totalLimit) * 100;
      gradient += `${budget.theme} ${currentPercent}% ${currentPercent + percent}%`;
      if (index < this.budgets.length - 1) gradient += ', ';
      currentPercent += percent;
    });
    return gradient + ')';
  }

  getThemeName(hex: string | undefined): string {
    if (!hex) return '';
    return (
      this.themeColors.find((c) => c.hex.toLowerCase() === hex.toLowerCase())?.name || 'Unknown'
    );
  }

  isCategoryUsed(cat: string, excludeId?: string | number): boolean {
    return this.budgets.some((b) => b.category === cat && b.id !== excludeId);
  }

  isThemeUsed(hex: string, excludeId?: string | number): boolean {
    return this.budgets.some(
      (b) => b.theme.toLowerCase() === hex.toLowerCase() && b.id !== excludeId,
    );
  }

  selectAddCategory(cat: string) {
    if (this.isCategoryUsed(cat)) return;
    this.newBudget.category = cat;
    this.isAddCategoryDropdownOpen = false;
  }
  selectAddTheme(hex: string) {
    if (this.isThemeUsed(hex)) return;
    this.newBudget.theme = hex;
    this.isAddThemeDropdownOpen = false;
  }
  selectEditCategory(cat: string) {
    if (!this.selectedBudget || this.isCategoryUsed(cat, this.selectedBudget.id)) return;
    this.selectedBudget.category = cat;
    this.isEditCategoryDropdownOpen = false;
  }
  selectEditTheme(hex: string) {
    if (!this.selectedBudget || this.isThemeUsed(hex, this.selectedBudget.id)) return;
    this.selectedBudget.theme = hex;
    this.isEditThemeDropdownOpen = false;
  }

  openModal() {
    this.isModalOpen = true;
    const availableCat = this.categories.find((c) => !this.isCategoryUsed(c));
    const availableTheme = this.themeColors.find((t) => !this.isThemeUsed(t.hex));
    this.newBudget = {
      category: availableCat || '',
      maximum: null as any,
      theme: availableTheme?.hex || '',
    };
  }
  closeModal() {
    this.isModalOpen = false;
    this.isAddCategoryDropdownOpen = false;
    this.isAddThemeDropdownOpen = false;
  }
  saveBudget() {
    this.newBudget.maximum = Number(this.newBudget.maximum);
    this.financeService.addBudget(this.newBudget as Budget).subscribe({
      next: () => {
        this.closeModal();
        this.loadData();
      },
    });
  }

  openEditModal(budget: Budget) {
    this.selectedBudget = { ...budget };
    this.isEditModalOpen = true;
    this.activeDropdown = null;
  }
  closeEditModal() {
    this.isEditModalOpen = false;
    this.selectedBudget = null;
    this.isEditCategoryDropdownOpen = false;
    this.isEditThemeDropdownOpen = false;
  }
  saveEditedBudget() {
    if (!this.selectedBudget || !this.selectedBudget.id) return;
    this.selectedBudget.maximum = Number(this.selectedBudget.maximum);
    this.financeService.updateBudget(this.selectedBudget).subscribe({
      next: () => {
        this.closeEditModal();
        this.loadData();
      },
    });
  }

  openDeleteModal(budget: Budget) {
    this.selectedBudget = budget;
    this.isDeleteModalOpen = true;
    this.activeDropdown = null;
  }
  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.selectedBudget = null;
  }
  confirmDelete() {
    if (!this.selectedBudget || !this.selectedBudget.id) return;
    this.financeService.deleteBudget(this.selectedBudget.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadData();
      },
    });
  }

  toggleDropdown(id: string | number | undefined) {
    if (!id) return;
    this.activeDropdown = this.activeDropdown === id ? null : id;
  }
  closeErrorModal() {
    this.errorModalMessage = null;
  }
}

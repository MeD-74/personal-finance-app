import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CurrencyPipe, DecimalPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService, Pot, Balance } from '../../core/services/finance';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pots',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, NgClass, FormsModule, TranslateModule],
  templateUrl: './pots.html',
  styleUrls: ['./pots.scss'],
})
export class Pots implements OnInit {
  financeService = inject(FinanceService);
  cdr = inject(ChangeDetectorRef);

  pots: Pot[] = [];
  balance: Balance | null = null;

  themeColors = [
    { name: 'Green', hex: '#277c78' },
    { name: 'Yellow', hex: '#f2cdac' },
    { name: 'Cyan', hex: '#82c9d7' },
    { name: 'Navy', hex: '#626070' },
    { name: 'Red', hex: '#c94736' },
    { name: 'Purple', hex: '#826cb0' },
  ];

  isAddModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;
  isMoneyModalOpen = false;

  errorModalMessage: string | null = null;

  isAddThemeDropdownOpen = false;
  isEditThemeDropdownOpen = false;

  activeDropdown: string | number | null = null;
  selectedPot: Pot | null = null;

  moneyMode: 'add' | 'withdraw' = 'add';
  moneyAmount: number | null = null;

  newPot: Partial<Pot> = { name: '', target: null as any, total: 0, theme: '#277c78' };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.financeService.getBalance().subscribe((b) => (this.balance = b));
    this.financeService.getPots().subscribe((p) => {
      this.pots = p;
      this.cdr.detectChanges();
    });
  }

  getPercent(total: number, target: number): number {
    if (!target || target === 0) return 0;
    const p = (total / target) * 100;
    return p > 100 ? 100 : p;
  }

  // --- Theme Logic ---
  getThemeName(hex: string | undefined): string {
    if (!hex) return '';
    return (
      this.themeColors.find((c) => c.hex.toLowerCase() === hex.toLowerCase())?.name || 'Unknown'
    );
  }

  isThemeUsed(hex: string, excludeId?: string | number): boolean {
    return this.pots.some((p) => p.theme.toLowerCase() === hex.toLowerCase() && p.id !== excludeId);
  }

  selectAddTheme(hex: string) {
    if (this.isThemeUsed(hex)) return;
    this.newPot.theme = hex;
    this.isAddThemeDropdownOpen = false;
  }

  selectEditTheme(hex: string) {
    if (!this.selectedPot || this.isThemeUsed(hex, this.selectedPot.id)) return;
    this.selectedPot.theme = hex;
    this.isEditThemeDropdownOpen = false;
  }

  toggleDropdown(id: string | number | undefined) {
    if (!id) return;
    this.activeDropdown = this.activeDropdown === id ? null : id;
  }

  openAddModal() {
    this.isAddModalOpen = true;
    const availableTheme = this.themeColors.find((t) => !this.isThemeUsed(t.hex));
    if (availableTheme) this.newPot.theme = availableTheme.hex;
  }
  closeAddModal() {
    this.isAddModalOpen = false;
    this.isAddThemeDropdownOpen = false;
  }

  savePot() {
    this.newPot.target = Number(this.newPot.target);
    this.financeService.addPot(this.newPot as Pot).subscribe(() => {
      this.closeAddModal();
      this.loadData();
      this.newPot = { name: '', target: null as any, total: 0, theme: '#277c78' };
    });
  }

  openEditModal(pot: Pot) {
    this.selectedPot = { ...pot };
    this.isEditModalOpen = true;
    this.activeDropdown = null;
  }
  closeEditModal() {
    this.isEditModalOpen = false;
    this.selectedPot = null;
    this.isEditThemeDropdownOpen = false;
  }

  saveEditedPot() {
    if (!this.selectedPot) return;
    this.selectedPot.target = Number(this.selectedPot.target);
    this.financeService.updatePot(this.selectedPot).subscribe(() => {
      this.closeEditModal();
      this.loadData();
    });
  }

  openDeleteModal(pot: Pot) {
    this.selectedPot = pot;
    this.isDeleteModalOpen = true;
    this.activeDropdown = null;
  }
  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.selectedPot = null;
  }

  confirmDelete() {
    if (!this.selectedPot || !this.selectedPot.id || !this.balance) return;
    if (this.selectedPot.total > 0) {
      this.balance.current += this.selectedPot.total;
      this.financeService.updateBalance(this.balance).subscribe();
    }
    this.financeService.deletePot(this.selectedPot.id).subscribe(() => {
      this.closeDeleteModal();
      this.loadData();
    });
  }

  openMoneyModal(pot: Pot, mode: 'add' | 'withdraw') {
    this.selectedPot = { ...pot };
    this.moneyMode = mode;
    this.moneyAmount = null;
    this.isMoneyModalOpen = true;
  }
  closeMoneyModal() {
    this.isMoneyModalOpen = false;
    this.selectedPot = null;
    this.moneyAmount = null;
  }
  closeErrorModal() {
    this.errorModalMessage = null;
  }

  confirmMoneyAction() {
    if (!this.selectedPot || !this.balance || !this.moneyAmount) return;
    const amount = Number(this.moneyAmount);

    if (this.moneyMode === 'add') {
      if (amount > this.balance.current) {
        this.errorModalMessage = 'INSUFFICIENT_BALANCE_ADD';
        return;
      }
      this.selectedPot.total += amount;
      this.balance.current -= amount;
    } else {
      if (amount > this.selectedPot.total) {
        this.errorModalMessage = 'INSUFFICIENT_POT_FUNDS';
        return;
      }
      this.selectedPot.total -= amount;
      this.balance.current += amount;
    }

    this.financeService.updateBalance(this.balance).subscribe(() => {
      this.financeService.updatePot(this.selectedPot!).subscribe(() => {
        this.closeMoneyModal();
        this.loadData();
      });
    });
  }
}

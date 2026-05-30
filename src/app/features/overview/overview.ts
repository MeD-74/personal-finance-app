import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CurrencyPipe, SlicePipe, DatePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  FinanceService,
  Balance,
  Pot,
  Transaction,
  Budget,
} from '../../core/services/finance';
import { SettingsService } from '../../core/services/settings';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CurrencyPipe, SlicePipe, DatePipe, NgClass, RouterLink, TranslateModule],
  templateUrl: './overview.html',
  styleUrls: ['./overview.scss'],
})
export class Overview implements OnInit {
  financeService = inject(FinanceService);
  cdr = inject(ChangeDetectorRef);

  settings = inject(SettingsService);

  balance: Balance | null = null;
  pots: Pot[] = [];
  transactions: Transaction[] = [];
  budgets: Budget[] = [];

  totalSaved = 0;
  totalBudgetLimit = 0;
  totalBudgetSpent = 0;

  recurringSummary = {
    paid: 0,
    upcoming: 0,
    dueSoon: 0,
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.financeService.getBalance().subscribe((data) => {
      this.balance = data;
      this.cdr.detectChanges();
    });

    this.financeService.getPots().subscribe((data) => {
      this.pots = data;
      this.totalSaved = this.pots.reduce((sum, pot) => sum + pot.total, 0);
      this.cdr.detectChanges();
    });

    this.financeService.getTransactions().subscribe((txs) => {
      this.transactions = txs;
      this.calculateRecurring(txs);

      this.financeService.getBudgets().subscribe((bds) => {
        this.budgets = bds;
        this.calculateBudgets(bds, txs);
        this.cdr.detectChanges();
      });
    });
  }

  calculateBudgets(bds: Budget[], txs: Transaction[]) {
    this.totalBudgetLimit = 0;
    this.totalBudgetSpent = 0;

    bds.forEach((budget) => {
      this.totalBudgetLimit += budget.maximum;
      const catTxs = txs.filter((t) => t.category === budget.category);
      const spent = Math.abs(
        catTxs.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0),
      );
      this.totalBudgetSpent += spent;
    });
  }

  calculateRecurring(txs: Transaction[]) {
    const recurringTxs = txs.filter((t) => t.recurring);
    const uniqueVendors = new Map<string, Transaction>();

    recurringTxs.forEach((tx) => {
      if (!uniqueVendors.has(tx.name)) {
        uniqueVendors.set(tx.name, tx);
      } else {
        const existing = uniqueVendors.get(tx.name)!;
        if (new Date(tx.date) > new Date(existing.date)) {
          uniqueVendors.set(tx.name, tx);
        }
      }
    });

    this.recurringSummary = { paid: 0, upcoming: 0, dueSoon: 0 };

    Array.from(uniqueVendors.values()).forEach((tx) => {
      const day = new Date(tx.date).getDate();
      const amount = Math.abs(tx.amount);

      if (day <= 19) {
        this.recurringSummary.paid += amount;
      } else if (day > 19 && day <= 24) {
        this.recurringSummary.dueSoon += amount;
        this.recurringSummary.upcoming += amount;
      } else {
        this.recurringSummary.upcoming += amount;
      }
    });
  }

  getBudgetGradient(): string {
    if (!this.budgets.length || this.totalBudgetLimit === 0) {
      return 'conic-gradient(#f8f4f0 0% 100%)';
    }
    let gradient = 'conic-gradient(';
    let currentPercent = 0;
    this.budgets.forEach((budget, index) => {
      let percent = (budget.maximum / this.totalBudgetLimit) * 100;
      gradient += `${budget.theme} ${currentPercent}% ${currentPercent + percent}%`;
      if (index < this.budgets.length - 1) gradient += ', ';
      currentPercent += percent;
    });
    return gradient + ')';
  }
}

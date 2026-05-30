import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CurrencyPipe, DecimalPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService, Transaction } from '../../core/services/finance';
import { TranslateModule } from '@ngx-translate/core';

export interface Bill extends Transaction {
  status: 'Paid' | 'Upcoming' | 'Due Soon';
  day: number;
  daySuffix: string;
}

@Component({
  selector: 'app-recurring-bills',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, NgClass, FormsModule, TranslateModule],
  templateUrl: './recurring-bills.html',
  styleUrls: ['./recurring-bills.scss'],
})
export class RecurringBills implements OnInit {
  financeService = inject(FinanceService);
  cdr = inject(ChangeDetectorRef);

  allBills: Bill[] = [];
  filteredBills: Bill[] = [];

  summary = {
    paidCount: 0,
    paidAmount: 0,
    upcomingCount: 0,
    upcomingAmount: 0,
    dueSoonCount: 0,
    dueSoonAmount: 0,
  };

  searchTerm = '';
  sortBy = 'Latest';
  sortOptions = ['Latest', 'Oldest', 'A to Z', 'Z to A', 'Highest', 'Lowest'];

  ngOnInit() {
    this.financeService.getTransactions().subscribe((data) => {
      this.processBills(data);
      this.applyFilters();
      this.cdr.detectChanges(); 
    });
  }

  processBills(transactions: Transaction[]) {
    const recurringTxs = transactions.filter((t) => t.recurring);

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

    this.summary = {
      paidCount: 0,
      paidAmount: 0,
      upcomingCount: 0,
      upcomingAmount: 0,
      dueSoonCount: 0,
      dueSoonAmount: 0,
    };

    this.allBills = Array.from(uniqueVendors.values()).map((tx) => {
      const day = new Date(tx.date).getDate();
      const amount = Math.abs(tx.amount);
      let status: 'Paid' | 'Upcoming' | 'Due Soon' = 'Upcoming';

      if (day <= 19) {
        status = 'Paid';
        this.summary.paidCount++;
        this.summary.paidAmount += amount;
      } else if (day > 19 && day <= 24) {
        status = 'Due Soon';
        this.summary.dueSoonCount++;
        this.summary.dueSoonAmount += amount;

        this.summary.upcomingCount++;
        this.summary.upcomingAmount += amount;
      } else {
        status = 'Upcoming';
        this.summary.upcomingCount++;
        this.summary.upcomingAmount += amount;
      }

      return { ...tx, amount, status, day, daySuffix: this.getDaySuffix(day) };
    });
  }

  getDaySuffix(day: number) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  applyFilters() {
    let temp = [...this.allBills];

    if (this.searchTerm.trim()) {
      temp = temp.filter((b) => b.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }

    temp.sort((a, b) => {
      switch (this.sortBy) {
        case 'Latest':
          return a.day - b.day;
        case 'Oldest':
          return b.day - a.day;
        case 'A to Z':
          return a.name.localeCompare(b.name);
        case 'Z to A':
          return b.name.localeCompare(a.name);
        case 'Highest':
          return b.amount - a.amount;
        case 'Lowest':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    this.filteredBills = temp;
  }
}

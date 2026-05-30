import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService, Transaction, Balance } from '../../core/services/finance';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsService } from '../../core/services/settings';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgClass, FormsModule, TranslateModule],
  templateUrl: './transactions.html',
  styleUrls: ['./transactions.scss'],
})
export class Transactions implements OnInit {
  financeService = inject(FinanceService);
  cdr = inject(ChangeDetectorRef);
  settings = inject(SettingsService);

  allTransactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  paginatedTransactions: Transaction[] = [];

  searchTerm = '';
  sortBy = 'Latest';
  selectedCategory = 'All Transactions';

  categories = [
    'All Transactions',
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
  formCategories = [
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
  sortOptions = ['Latest', 'Oldest', 'A to Z', 'Z to A', 'Highest', 'Lowest'];

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  isModalOpen = false;
  newTx: Partial<Transaction> = {
    name: '',
    category: 'General',
    amount: null as any,
    date: '',
    recurring: false,
  };

  isDeleteModalOpen = false;
  selectedTxToDelete: Transaction | null = null;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.financeService.getTransactions().subscribe((data) => {
      this.allTransactions = data;
      this.applyFilters();
      this.cdr.detectChanges();
    });
  }

  openModal() {
    this.isModalOpen = true;
  }
  closeModal() {
    this.isModalOpen = false;
  }

  saveTransaction() {
    this.newTx.avatar = `https://ui-avatars.com/api/?name=${this.newTx.name}&background=random`;
    this.newTx.amount = Number(this.newTx.amount);
    if (!this.newTx.date) this.newTx.date = new Date().toISOString();

    this.financeService.addTransaction(this.newTx as Transaction).subscribe({
      next: () => {
        this.financeService.getBalance().subscribe({
          next: (balance) => {
            const amount = this.newTx.amount as number;
            if (amount > 0) {
              balance.income += amount;
              balance.current += amount;
            } else {
              balance.expenses += Math.abs(amount);
              balance.current += amount;
            }
            this.financeService.updateBalance(balance).subscribe({
              next: () => {
                this.closeModal();
                this.loadData();
                this.newTx = {
                  name: '',
                  category: 'General',
                  amount: null as any,
                  date: '',
                  recurring: false,
                };
              },
            });
          },
        });
      },
    });
  }

  openDeleteModal(tx: Transaction) {
    this.selectedTxToDelete = tx;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.selectedTxToDelete = null;
  }

  confirmDelete() {
    if (!this.selectedTxToDelete || !this.selectedTxToDelete.id) return;

    this.financeService.getBalance().subscribe({
      next: (balance) => {
        const amount = this.selectedTxToDelete!.amount;

        if (amount > 0) {
          balance.income -= amount; 
          balance.current -= amount; 
        } else {
          balance.expenses -= Math.abs(amount); 
          balance.current += Math.abs(amount); 
        }

        this.financeService.updateBalance(balance).subscribe({
          next: () => {
            this.financeService.deleteTransaction(this.selectedTxToDelete!.id!).subscribe({
              next: () => {
                this.closeDeleteModal();
                this.loadData(); 
              },
            });
          },
        });
      },
    });
  }

  applyFilters() {
    let temp = [...this.allTransactions];
    if (this.searchTerm.trim())
      temp = temp.filter((t) => t.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
    if (this.selectedCategory !== 'All Transactions')
      temp = temp.filter((t) => t.category === this.selectedCategory);

    temp.sort((a, b) => {
      let dateA = new Date(a.date).getTime();
      let dateB = new Date(b.date).getTime();
      switch (this.sortBy) {
        case 'Latest':
          return dateB - dateA;
        case 'Oldest':
          return dateA - dateB;
        case 'A to Z':
          return a.name.localeCompare(b.name);
        case 'Z to A':
          return b.name.localeCompare(a.name);
        case 'Highest':
          return Math.abs(b.amount) - Math.abs(a.amount);
        case 'Lowest':
          return Math.abs(a.amount) - Math.abs(b.amount);
        default:
          return 0;
      }
    });

    this.filteredTransactions = temp;
    this.totalPages = Math.ceil(this.filteredTransactions.length / this.itemsPerPage) || 1;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedTransactions = this.filteredTransactions.slice(
      startIndex,
      startIndex + this.itemsPerPage,
    );
  }
  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }
  getPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}

import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface Transaction {
  id?: string | number;
  avatar: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  recurring: boolean;
}
export interface Balance {
  current: number;
  income: number;
  expenses: number;
}
export interface Pot {
  id?: string | number;
  name: string;
  target: number;
  total: number;
  theme: string;
}
export interface Budget {
  id?: string | number;
  category: string;
  maximum: number;
  theme: string;
}

export interface AppData {
  balance: Balance;
  transactions: Transaction[];
  pots: Pot[];
  budgets: Budget[];
}

@Injectable({
  providedIn: 'root',
})
export class FinanceService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private storageKey = 'finance_portfolio_data';

  private getAppData(): Observable<AppData> {
    if (isPlatformBrowser(this.platformId)) {
      const localData = localStorage.getItem(this.storageKey);
      if (localData) {
        return of(JSON.parse(localData));
      }
    }

    return this.http.get<AppData>('assets/db.json').pipe(
      tap((data) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(this.storageKey, JSON.stringify(data));
        }
      }),
    );
  }

  private saveAppData(data: AppData) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    }
  }

  getBalance(): Observable<Balance> {
    return this.getAppData().pipe(map((data) => data.balance));
  }
  updateBalance(balance: Balance): Observable<Balance> {
    return this.getAppData().pipe(
      map((data) => {
        data.balance = balance;
        this.saveAppData(data);
        return balance;
      }),
    );
  }

  getTransactions(): Observable<Transaction[]> {
    return this.getAppData().pipe(map((data) => data.transactions));
  }

  addTransaction(tx: Transaction): Observable<Transaction> {
    return this.getAppData().pipe(
      map((data) => {
        tx.id = Date.now().toString();

        const amount = Number(tx.amount);
        tx.amount = amount;

        if (amount > 0) {
          data.balance.current += amount;
          data.balance.income += amount;
        } else {
          data.balance.current += amount;
          data.balance.expenses += Math.abs(amount);
        }

        data.transactions.unshift(tx);
        this.saveAppData(data);
        return tx;
      }),
    );
  }

  deleteTransaction(id: string | number): Observable<void> {
    return this.getAppData().pipe(
      map((data) => {
        const txToDelete = data.transactions.find((t) => t.id === id);

        if (txToDelete) {
          const amount = Number(txToDelete.amount);
          if (amount > 0) {
            data.balance.current -= amount;
            data.balance.income -= amount;
          } else {
            data.balance.current -= amount;
            data.balance.expenses -= Math.abs(amount);
          }
        }

        data.transactions = data.transactions.filter((t) => t.id !== id);
        this.saveAppData(data);
      }),
    );
  }

  getPots(): Observable<Pot[]> {
    return this.getAppData().pipe(map((data) => data.pots));
  }
  addPot(pot: Pot): Observable<Pot> {
    return this.getAppData().pipe(
      map((data) => {
        pot.id = Date.now().toString();
        data.pots.push(pot);
        this.saveAppData(data);
        return pot;
      }),
    );
  }
  updatePot(pot: Pot): Observable<Pot> {
    return this.getAppData().pipe(
      map((data) => {
        const index = data.pots.findIndex((p) => p.id === pot.id);
        if (index !== -1) data.pots[index] = pot;
        this.saveAppData(data);
        return pot;
      }),
    );
  }
  deletePot(id: string | number): Observable<void> {
    return this.getAppData().pipe(
      map((data) => {
        data.pots = data.pots.filter((p) => p.id !== id);
        this.saveAppData(data);
      }),
    );
  }

  getBudgets(): Observable<Budget[]> {
    return this.getAppData().pipe(map((data) => data.budgets));
  }
  addBudget(budget: Budget): Observable<Budget> {
    return this.getAppData().pipe(
      map((data) => {
        budget.id = Date.now().toString();
        data.budgets.push(budget);
        this.saveAppData(data);
        return budget;
      }),
    );
  }
  updateBudget(budget: Budget): Observable<Budget> {
    return this.getAppData().pipe(
      map((data) => {
        const index = data.budgets.findIndex((b) => b.id === budget.id);
        if (index !== -1) data.budgets[index] = budget;
        this.saveAppData(data);
        return budget;
      }),
    );
  }
  deleteBudget(id: string | number): Observable<void> {
    return this.getAppData().pipe(
      map((data) => {
        data.budgets = data.budgets.filter((b) => b.id !== id);
        this.saveAppData(data);
      }),
    );
  }
}

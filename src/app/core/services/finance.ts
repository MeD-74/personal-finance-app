import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root',
})
export class FinanceService {
  private http = inject(HttpClient);
  private apiUrl = 'https://personal-finance-app-my9b.onrender.com';

  getBalance(): Observable<Balance> {
    return this.http.get<Balance>(`${this.apiUrl}/balance`);
  }
  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions`);
  }
  getPots(): Observable<Pot[]> {
    return this.http.get<Pot[]>(`${this.apiUrl}/pots`);
  }
  getBudgets(): Observable<Budget[]> {
    return this.http.get<Budget[]>(`${this.apiUrl}/budgets`);
  }

  addTransaction(tx: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/transactions`, tx);
  }
  deleteTransaction(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/transactions/${id}`);
  } 

  updateBalance(balance: Balance): Observable<Balance> {
    return this.http.put<Balance>(`${this.apiUrl}/balance`, balance);
  }

  addBudget(budget: Budget): Observable<Budget> {
    return this.http.post<Budget>(`${this.apiUrl}/budgets`, budget);
  }
  updateBudget(budget: Budget): Observable<Budget> {
    return this.http.put<Budget>(`${this.apiUrl}/budgets/${budget.id}`, budget);
  }
  deleteBudget(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/budgets/${id}`);
  }

  addPot(pot: Pot): Observable<Pot> {
    return this.http.post<Pot>(`${this.apiUrl}/pots`, pot);
  }
  updatePot(pot: Pot): Observable<Pot> {
    return this.http.put<Pot>(`${this.apiUrl}/pots/${pot.id}`, pot);
  }
  deletePot(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/pots/${id}`);
  }
}

import { Routes } from '@angular/router';
import { Overview } from './features/overview/overview';
import { Transactions } from './features/transactions/transactions';
import { Budgets } from './features/budgets/budgets';
import { Pots } from './features/pots/pots';
import { RecurringBills } from './features/recurring-bills/recurring-bills';
import { Login } from './features/auth/login/login';
import { Signup } from './features/auth/signup/signup';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, 
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'overview', component: Overview },
  { path: 'transactions', component: Transactions },
  { path: 'budgets', component: Budgets },
  { path: 'pots', component: Pots },
  { path: 'recurring', component: RecurringBills },
];

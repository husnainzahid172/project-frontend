import type { Transaction } from './types';

export const initialTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 2500,
    category: 'Salary',
    description: 'Monthly salary',
    date: new Date('2024-07-01'),
  },
  {
    id: '2',
    type: 'expense',
    amount: 80,
    category: 'Food',
    description: 'Groceries for the week',
    date: new Date('2024-07-03'),
  },
  {
    id: '3',
    type: 'expense',
    amount: 50,
    category: 'Transportation',
    description: 'Monthly bus pass',
    date: new Date('2024-07-05'),
  },
  {
    id: '4',
    type: 'expense',
    amount: 1200,
    category: 'Rent',
    description: 'Apartment rent',
    date: new Date('2024-07-01'),
  },
  {
    id: '5',
    type: 'expense',
    amount: 35,
    category: 'Entertainment',
    description: 'Movie ticket',
    date: new Date('2024-07-08'),
  },
].sort((a, b) => b.date.getTime() - a.date.getTime());

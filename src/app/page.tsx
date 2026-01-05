"use client";

import { useState } from 'react';
import type { Transaction } from '@/lib/types';
import { initialTransactions } from '@/lib/data';
import Dashboard from '@/app/components/dashboard';
import ExpenseForm from '@/app/components/expense-form';
import ExpenseList from '@/app/components/expense-list';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };
    setTransactions(prev => [newTransaction, ...prev].sort((a, b) => b.date.getTime() - a.date.getTime()));
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-headline font-bold text-center tracking-tight">TrackWise</h1>
          <p className="text-muted-foreground text-center mt-2">Your simple and smart expense tracker.</p>
        </header>

        <Dashboard income={totalIncome} expenses={totalExpenses} balance={balance} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <PlusCircle className="text-primary" />
                  Add Transaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ExpenseForm onSubmit={handleAddTransaction} />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-3">
             <ExpenseList transactions={transactions} onDelete={handleDeleteTransaction} />
          </div>
        </div>
      </div>
    </main>
  );
}

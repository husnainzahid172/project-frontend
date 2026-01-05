import SummaryCard from './summary-card';
import { ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';

type DashboardProps = {
  income: number;
  expenses: number;
  balance: number;
};

export default function Dashboard({ income, expenses, balance }: DashboardProps) {
  const incomeColor = "text-green-600 dark:text-green-400";
  const expenseColor = "text-red-600 dark:text-red-400";
  const balanceColor = balance >= 0 ? "text-foreground" : expenseColor;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SummaryCard
        title="Total Income"
        value={income}
        icon={<ArrowUpRight className={incomeColor} />}
        valueClassName={incomeColor}
      />
      <SummaryCard
        title="Total Expenses"
        value={expenses}
        icon={<ArrowDownLeft className={expenseColor} />}
        valueClassName={expenseColor}
      />
      <SummaryCard
        title="Current Balance"
        value={balance}
        icon={<Wallet className="text-primary" />}
        valueClassName={balanceColor}
      />
    </div>
  );
}

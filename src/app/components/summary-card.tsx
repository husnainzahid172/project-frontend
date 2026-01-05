import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type SummaryCardProps = {
  title: string;
  value: number;
  icon: ReactNode;
  valueClassName?: string;
};

export default function SummaryCard({ title, value, icon, valueClassName }: SummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", valueClassName)}>
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
        </div>
      </CardContent>
    </Card>
  );
}

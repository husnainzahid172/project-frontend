import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, List } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


type ExpenseListProps = {
  transactions: Transaction[];
  onDelete: (id: string) => void;
};

export default function ExpenseList({ transactions, onDelete }: ExpenseListProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <List className="text-primary" />
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[485px] pr-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[35%]">Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium truncate">{t.description}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{t.category}</Badge>
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '-'}
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(t.amount)}
                    </TableCell>
                    <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-center">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                              <span className="sr-only">Delete</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this transaction.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(t.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                    No transactions yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

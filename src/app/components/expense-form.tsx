"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Sparkles } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Transaction } from '@/lib/types';
import { getCategorySuggestions } from '@/lib/actions';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  description: z.string().min(2, 'Description must be at least 2 characters').max(100, 'Description must be 100 characters or less'),
  amount: z.coerce.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  date: z.date({ required_error: 'Date is required' }),
  type: z.enum(['income', 'expense'], { required_error: 'Type is required' }),
});

type ExpenseFormProps = {
  onSubmit: (data: Omit<Transaction, 'id' | 'date'> & { date: Date | undefined }) => void;
  isPending: boolean;
};

const expenseCategories = [
  "Food", "Transportation", "Rent", "Utilities", "Entertainment", 
  "Health", "Shopping", "Education", "Travel", "Other"
];
const incomeCategories = ["Salary", "Freelance", "Investment", "Gift", "Other"];

export default function ExpenseForm({ onSubmit, isPending }: ExpenseFormProps) {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: undefined,
      category: '',
      date: new Date(),
      type: 'expense',
    },
  });

  const transactionType = form.watch('type');

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values);
    form.reset({ description: '', amount: undefined, category: '', date: new Date(), type: values.type });
    setSuggestions([]);
  }

  const handleSuggestClick = async () => {
    const description = form.getValues('description');
    if (!description || description.length < 3) {
      form.setError("description", { type: "manual", message: "Enter a description of at least 3 characters to get suggestions." });
      return;
    }
    setIsSuggesting(true);
    setSuggestions([]);
    const result = await getCategorySuggestions(description);
    setIsSuggesting(false);

    if (result.suggestions && result.suggestions.length > 0) {
      setSuggestions(result.suggestions);
    } else {
      toast({
        variant: "destructive",
        title: "AI Suggestion",
        description: result.message || "Could not fetch suggestions. The AI might be offline."
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Coffee with friends" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex items-center justify-end -mt-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleSuggestClick} disabled={isSuggesting}>
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              {isSuggesting ? "Thinking..." : "AI Suggest Category"}
            </Button>
        </div>

        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            <p className="text-sm text-muted-foreground w-full">Suggestions:</p>
            {suggestions.map((suggestion) => (
              <Badge
                key={suggestion}
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => {
                  form.setValue('category', suggestion, { shouldValidate: true });
                  setSuggestions([]);
                }}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        )}

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} step="0.01" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue('category', '');
                  }}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="expense" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Expense</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="income" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Income</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
               <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(transactionType === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date('2000-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full !mt-6" disabled={isPending}>
          {isPending ? 'Adding...' : 'Add Transaction'}
        </Button>
      </form>
    </Form>
  );
}

'use server';

import { suggestExpenseCategory } from '@/ai/flows/suggest-expense-category';
import { z } from 'zod';
import type { Transaction } from './types';

// AI Suggestion Action
const SuggestionInputSchema = z.object({
  description: z.string().min(3, { message: 'Description must be at least 3 characters long.' }),
});

type SuggestionState = {
  message?: string;
  suggestions?: string[];
  errors?: { description?: string[] };
}

export async function getCategorySuggestions(description: string): Promise<SuggestionState> {
  const validatedFields = SuggestionInputSchema.safeParse({ description });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await suggestExpenseCategory({ description: validatedFields.data.description });
    return {
      message: 'Suggestions fetched.',
      suggestions: result.categorySuggestions,
    };
  } catch (e) {
    return {
      message: 'Failed to get suggestions from AI.',
    };
  }
}

// Transaction Actions
const TransactionSchema = z.object({
  description: z.string().min(2).max(100),
  amount: z.coerce.number().positive(),
  category: z.string().min(1),
  date: z.date(),
  type: z.enum(['income', 'expense']),
});

type TransactionState = {
  success: boolean;
  message: string;
  data?: Transaction;
  errors?: any;
}

export async function addTransaction(data: Omit<Transaction, 'id' | 'date'> & { date: Date | undefined }): Promise<TransactionState> {
  const validatedFields = TransactionSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid data provided.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const newTransaction: Transaction = {
      ...validatedFields.data,
      id: crypto.randomUUID(),
      date: validatedFields.data.date,
    };
    // Here you would typically save to a database
    // For now, we'll just return the created object
    return { success: true, message: "Transaction added.", data: newTransaction };
  } catch (e) {
    return { success: false, message: 'Failed to create transaction.' };
  }
}

type DeleteTransactionState = {
  success: boolean;
  message: string;
}

export async function deleteTransaction(id: string): Promise<DeleteTransactionState> {
   if (!id) {
    return { success: false, message: "ID is required." };
  }
  try {
    // Here you would delete from a database
    return { success: true, message: "Transaction deleted." };
  } catch (e) {
    return { success: false, message: "Failed to delete transaction." };
  }
}

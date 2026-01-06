'use server';

import { suggestExpenseCategory } from '@/ai/flows/suggest-expense-category';
import { z } from 'zod';
import type { Transaction } from './types';

// Step 1: Backend URL from environment variables (non-null assertion to satisfy TypeScript)
const API_URL = process.env.NEXT_PUBLIC_API_URL!;

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

// Step 2: addTransaction calls backend
export async function addTransaction(
  data: Omit<Transaction, 'id' | 'date'> & { date: Date | undefined }
): Promise<TransactionState> {
  const validatedFields = TransactionSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid data provided.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const res = await fetch(`${API_URL}/api/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedFields.data),
    });

    if (!res.ok) {
      const errData = await res.json();
      return { success: false, message: errData.message || "Failed to add transaction" };
    }

    const result: Transaction = await res.json();

    return { success: true, message: "Transaction added.", data: result };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Network error" };
  }
}

// Step 2: deleteTransaction calls backend
type DeleteTransactionState = {
  success: boolean;
  message: string;
}

export async function deleteTransaction(id: string): Promise<DeleteTransactionState> {
  if (!id) return { success: false, message: "ID is required." };

  try {
    const res = await fetch(`${API_URL}/api/expenses/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errData = await res.json();
      return { success: false, message: errData.message || "Failed to delete transaction" };
    }

    return { success: true, message: "Transaction deleted." };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Network error" };
  }
}

'use server';

import { suggestExpenseCategory } from '@/ai/flows/suggest-expense-category';
import { z } from 'zod';

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

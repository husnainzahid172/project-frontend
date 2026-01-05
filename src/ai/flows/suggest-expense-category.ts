'use server';

/**
 * @fileOverview AI-powered expense category suggestion flow.
 *
 * This file defines a Genkit flow that suggests expense categories based on a user-provided description.
 *
 * @exports suggestExpenseCategory - The main function to trigger the expense category suggestion flow.
 * @exports SuggestExpenseCategoryInput - The input type for the suggestExpenseCategory function.
 * @exports SuggestExpenseCategoryOutput - The output type for the suggestExpenseCategory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestExpenseCategoryInputSchema = z.object({
  description: z
    .string()
    .describe('The description of the expense for which to suggest categories.'),
});
export type SuggestExpenseCategoryInput = z.infer<typeof SuggestExpenseCategoryInputSchema>;

const SuggestExpenseCategoryOutputSchema = z.object({
  categorySuggestions: z
    .array(z.string())
    .describe('An array of suggested expense categories based on the description.'),
});
export type SuggestExpenseCategoryOutput = z.infer<typeof SuggestExpenseCategoryOutputSchema>;

export async function suggestExpenseCategory(
  input: SuggestExpenseCategoryInput
): Promise<SuggestExpenseCategoryOutput> {
  return suggestExpenseCategoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestExpenseCategoryPrompt',
  input: {schema: SuggestExpenseCategoryInputSchema},
  output: {schema: SuggestExpenseCategoryOutputSchema},
  prompt: `You are an expert financial advisor. Your job is to help the user categorize their expenses.

  Based on the description of the expense provided, suggest a few relevant expense categories.  Return ONLY the category names in an array.

  Description: {{{description}}}
  `,
});

const suggestExpenseCategoryFlow = ai.defineFlow(
  {
    name: 'suggestExpenseCategoryFlow',
    inputSchema: SuggestExpenseCategoryInputSchema,
    outputSchema: SuggestExpenseCategoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

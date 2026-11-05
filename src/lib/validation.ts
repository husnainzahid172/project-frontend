import { z } from 'zod';

const trimmed = (min: number, max: number, msg: string) =>
  z.string().trim().min(min, msg).max(max, 'Too long');

export const customerSchema = z.object({
  name: trimmed(2, 120, 'Please enter your full name'),
  email: z.string().trim().toLowerCase().email('Please enter a valid email').max(200),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{7,20}$/, 'Please enter a valid phone number, including country code'),
  institution: z.string().trim().max(160).optional().or(z.literal('')),
  addressLine1: trimmed(3, 160, 'Please enter your street address'),
  addressLine2: z.string().trim().max(160).optional().or(z.literal('')),
  city: trimmed(2, 80, 'Please enter your town or city'),
  postalCode: trimmed(2, 16, 'Please enter your postcode'),
  countryCode: z.string().trim().length(2).toUpperCase(),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
  termsAccepted: z.literal(true, { errorMap: () => ({ message: 'Please accept the terms of sale' }) }),
});

export const orderRequestSchema = z.object({
  idempotencyKey: z.string().uuid(),
  currency: z.enum(['GBP', 'EUR']),
  customer: customerSchema,
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(64),
        format: z.enum(['single', 'kit']),
        quantity: z.number().int().min(1).max(100),
      })
    )
    .min(1, 'Your cart is empty')
    .max(30),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type OrderRequest = z.infer<typeof orderRequestSchema>;

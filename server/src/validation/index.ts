import { z } from 'zod';

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});
export type PaginationQuery = z.infer<typeof paginationQuery>;

export const emailSchema = z.string().trim().toLowerCase().email().max(254);

export const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(128, 'Use at most 128 characters')
  .regex(/[a-z]/, 'Include a lowercase letter')
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/\d/, 'Include a number');

<<<<<<< HEAD
export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(80),
=======
export const nameSchema = z
  .string()
  .trim()
  .min(3, 'Name must be at least 3 characters')
  .max(80, 'Name must be at most 80 characters')
  .refine((v) => !v.includes('@'), { message: 'Name cannot contain @' });

export const registerSchema = z.object({
  name: nameSchema,
>>>>>>> 69790ac84eecb67513ed2092a1f6cb35277c2da6
  email: emailSchema,
  password: passwordSchema,
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
<<<<<<< HEAD
  email: emailSchema,
=======
  loginIdentifier: z.string().trim().min(1, 'Enter your name or email').max(254),
>>>>>>> 69790ac84eecb67513ed2092a1f6cb35277c2da6
  password: z.string().min(1, 'Enter your password').max(128),
});
export type LoginInput = z.infer<typeof loginSchema>;

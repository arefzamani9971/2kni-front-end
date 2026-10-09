import type { z } from 'zod';

export type Infer<T extends z.ZodType> = z.output<T>;

export type InferInput<T extends z.ZodType> = z.input<T>;

export type Schema<TOut = unknown, TIn = unknown> = z.ZodType<TOut, TIn>;
import type { createRules } from './schema';
export type ValidationRules = ReturnType<typeof createRules>;

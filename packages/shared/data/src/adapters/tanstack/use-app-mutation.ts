'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AppError } from '@dukani/domain';
import type { AppMutationOptions, AppMutationResult } from '../../types';
import { asAppError } from './app-error';

export function useAppMutation<TData, TVariables = void>(
  options: AppMutationOptions<TData, TVariables>,
): AppMutationResult<TData, TVariables> {
  const client = useQueryClient();
  const m = useMutation<TData, AppError, TVariables>({
    mutationFn: options.mutationFn,
    onSuccess: async (data, variables) => {
      await Promise.all((options.invalidates ?? []).map((queryKey) => client.invalidateQueries({ queryKey })));
      await options.onSuccess?.(data, variables);
    },
    onError: (error, variables) => options.onError?.(asAppError(error)!, variables),
    onSettled: () => options.onSettled?.(),
  });
  return {
    mutate: m.mutate,
    mutateAsync: m.mutateAsync,
    data: m.data,
    error: asAppError(m.error),
    status: m.status,
    isPending: m.isPending,
    reset: m.reset,
  };
}

import type { Dto } from '@dukani/contracts';

export const categoryOptions = (
  nodes: readonly Dto<'CategoryNodeDto'>[],
): { value: string; label: string }[] =>
  nodes.flatMap((category) => [
    { value: category.id, label: category.name },
    ...categoryOptions(category.children),
  ]);

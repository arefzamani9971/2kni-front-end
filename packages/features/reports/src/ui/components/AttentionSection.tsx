'use client';
import { ButtonLink, ListRow, Section } from '@dukani/ui-kit';
import { useAttention } from '../hooks/use-attention';
import type { AttentionAction } from './AttentionSection.types';

/** «نیازمند توجه»: counts from the action center + the matching fixes (hidden when nothing is open). */
export function AttentionSection({ actions }: { actions: readonly AttentionAction[] }) {
  const q = useAttention();
  if (!q.data || q.data.length === 0) return null;
  const kinds = new Set(q.data.map((i) => i.kind));
  const fixes = actions.filter((a) => kinds.has(a.kind));
  return (
    <Section title="نیازمند توجه">
      {q.data.map((i) => (
        <ListRow key={i.kind}>{i.label}</ListRow>
      ))}
      {fixes.map((a) => (
        <ButtonLink key={a.kind} href={a.href}>
          {a.label}
        </ButtonLink>
      ))}
    </Section>
  );
}

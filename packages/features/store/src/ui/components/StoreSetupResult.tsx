'use client';
import type { AppError } from '@dukani/domain';
import { Alert, Badge, Button, ListRow, ResultScreen, Screen, Section, StickyActionBar } from '@dukani/ui-kit';
import type { StoreProfile } from '../../application/ports';
import type { SectionState, SetupSection } from '../../domain/store-draft.types';
import { SECTION_BADGE, SECTION_LABELS } from './StoreSetupResult.constants';
import type { SetupExit } from './StoreSetupResult.types';

/**
 * STORE-SUCCESS (core-user-flows F02 step 4; no Figma frame — composed from ui-kit «ResultScreen»):
 * shown only after the server created the store. Each optional section has its own result; a failed one is
 * retried alone and never re-creates the store (F02 §8). Entering the panel is always possible.
 */
export function StoreSetupResult({
  store,
  sections,
  errors,
  busy,
  onRetry,
  onExit,
}: {
  store: StoreProfile;
  sections: Readonly<Record<SetupSection, SectionState>>;
  errors: Readonly<Partial<Record<SetupSection, AppError>>>;
  busy: boolean;
  onRetry: (section: SetupSection) => void;
  onExit: (to: SetupExit) => void;
}) {
  const shown = (Object.keys(sections) as SetupSection[]).filter((k) => sections[k] !== 'skipped');
  const failed = shown.filter((k) => sections[k] === 'failed');
  return (
    <Screen
      actions={
        <StickyActionBar>
          <Button block disabled={busy} onClick={() => onExit('first-product')}>
            ثبت اولین کالا
          </Button>
          <Button block variant="secondary" disabled={busy} onClick={() => onExit('complete-info')}>
            تکمیل اطلاعات فروشگاه
          </Button>
          <Button block variant="secondary" disabled={busy} onClick={() => onExit('home')}>
            ورود به پنل
          </Button>
        </StickyActionBar>
      }
    >
      <ResultScreen
        title={`فروشگاه «${store.name}» ساخته شد`}
        description="بدون نشانی و اطلاعات بانکی هم می‌توانید اولین کالا را ثبت کنید."
      />
      {failed.length ? (
        <Alert
          tone="warning"
          title="فروشگاه ساخته شد؛ بخشی از اطلاعات تکمیلی ذخیره نشد"
          description="فقط همان بخش را دوباره بفرستید؛ فروشگاه دوباره ساخته نمی‌شود."
        />
      ) : null}
      {shown.length ? (
        <Section title="اطلاعات تکمیلی">
          {shown.map((k) => {
            const state = sections[k] as Exclude<SectionState, 'skipped'>;
            return (
              <ListRow
                key={k}
                trailing={
                  state === 'failed' ? (
                    <Button size="sm" variant="secondary" disabled={busy} onClick={() => onRetry(k)}>
                      تلاش دوباره
                    </Button>
                  ) : (
                    <Badge tone={SECTION_BADGE[state].tone}>{SECTION_BADGE[state].label}</Badge>
                  )
                }
              >
                {SECTION_LABELS[k]}
                {state === 'failed' && errors[k] ? (
                  <span className="text-body-s text-danger block">{errors[k].message}</span>
                ) : null}
              </ListRow>
            );
          })}
        </Section>
      ) : null}
    </Screen>
  );
}

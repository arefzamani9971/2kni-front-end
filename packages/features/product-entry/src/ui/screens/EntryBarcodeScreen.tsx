'use client';
import { rules, s, useAppForm } from '@dukani/forms';
import { Button, ListRow, Section, BarcodeField } from '@dukani/ui-kit';
import { BackButton, EntryShell } from '../components/EntryShell';
import { useEntryNav } from '../hooks/use-entry';

const schema = s.object({ code: rules.barcode() });

/** barcode (Figma 358:490): manual barcode entry; the camera scanner (F08) reuses the same lookup. */
export function EntryBarcodeScreen() {
  const go = useEntryNav();
  const form = useAppForm({ schema, defaultValues: { code: '' } });
  const submit = form.handleSubmit(({ code }) => go.search(code));
  return (
    <form noValidate onSubmit={submit} className="contents">
      <EntryShell
        title="ورود دستی بارکد"
        actions={
          <>
            <Button type="submit" block>
              بررسی بارکد
            </Button>
            <BackButton onClick={go.method} />
          </>
        }
      >
        <Section title="بارکد کالا">
          <form.Field name="code">{(f) => <BarcodeField {...f} label="بارکد روی بسته‌بندی" autoFocus required />}</form.Field>
          <ListRow>بارکد شرط ثبت کالا نیست؛ کالای بدون بارکد را با نام پیدا یا ثبت کنید.</ListRow>
        </Section>
      </EntryShell>
    </form>
  );
}

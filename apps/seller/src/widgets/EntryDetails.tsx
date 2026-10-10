'use client';
import { CreateBrandForm, CreateTypeForm } from '@dukani/catalog';
import { EntryDetailsScreen } from '@dukani/product-entry';
export function EntryDetails({ draftId }: { draftId: string }) {
  return (
    <EntryDetailsScreen
      draftId={draftId}
      creators={{
        brand: (props) => <CreateBrandForm {...props} />,
        type: (props) => <CreateTypeForm {...props} />,
      }}
    />
  );
}

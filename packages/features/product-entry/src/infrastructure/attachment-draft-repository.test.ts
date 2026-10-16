import { describe, expect, it, vi } from 'vitest';
import { createMemoryDraftStore } from '@dukani/platform';
import { createAttachmentDrafts } from './attachment-draft-repository';
import { emptyAttachmentDraft } from '../domain/catalog-attachment';

describe('attachment draft persistence', () => {
  it('drains pending edits before review without writing an unchanged draft again', async () => {
    const store = createMemoryDraftStore();
    const put = vi.spyOn(store, 'put');
    const drafts = createAttachmentDrafts(store, () => 'actor');
    await drafts.update('store', emptyAttachmentDraft);
    const edit = drafts.update('store', (current) => ({ ...current!, stage: 'review' }));
    const barrier = drafts.update('store', (current) => current!);
    expect((await barrier).stage).toBe('review');
    await edit;
    expect(put).toHaveBeenCalledTimes(2);
  });

  it('recovers its queue after a failed write and isolates user/store scopes', async () => {
    const store = createMemoryDraftStore();
    let actor = 'one';
    const drafts = createAttachmentDrafts(store, () => actor);
    vi.spyOn(store, 'put').mockRejectedValueOnce(new Error('disk full'));
    await expect(drafts.update('store', emptyAttachmentDraft)).rejects.toThrow('disk full');
    await drafts.update('store', () => ({ ...emptyAttachmentDraft(), stage: 'review' }));
    actor = 'two';
    expect(await drafts.get('store')).toBeNull();
    await drafts.update('store', emptyAttachmentDraft);
    actor = 'one';
    expect((await drafts.get('store'))?.stage).toBe('review');
    expect(await drafts.get('other-store')).toBeNull();
  });
});

import { createAttachmentUploader } from './upload-attachments';
const selection = () =>
  [
    { id: 'a', file: new File(['a'], 'a.pdf') },
    { id: 'b', file: new File(['b'], 'b.pdf') },
  ] as const;
describe('receipt upload retries', () => {
  it('retries the failed file without uploading successful files again', async () => {
    const items = selection();
    const upload = vi
      .fn()
      .mockResolvedValueOnce({ fileId: 'server-a' })
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ fileId: 'server-b' });
    const save = createAttachmentUploader({ uploader: { upload }, storeId: 'store', purchaseId: 'receipt' });
    const state = vi.fn();
    await expect(save(items, state)).rejects.toThrow('offline');
    expect(state).toHaveBeenCalledWith('b', 'failed');
    expect(await save(items, state)).toEqual(['server-a', 'server-b']);
    expect(upload.mock.calls.map((call) => call[1])).toEqual([items[0].file, items[1].file, items[1].file]);
  });
  it('reuses uploads when linking attachments fails and ignores removed selections', async () => {
    const items = selection();
    const upload = vi
      .fn()
      .mockResolvedValueOnce({ fileId: 'server-a' })
      .mockResolvedValueOnce({ fileId: 'server-b' });
    const save = createAttachmentUploader({ uploader: { upload }, storeId: 'store', purchaseId: 'receipt' });
    await save(items, vi.fn());
    expect(await save([items[1]], vi.fn())).toEqual(['server-b']);
    expect(upload).toHaveBeenCalledTimes(2);
  });
  it('uploads replacement file content even when its selection id is reused', async () => {
    const items = selection();
    const upload = vi.fn().mockResolvedValueOnce({ fileId: 'old' }).mockResolvedValueOnce({ fileId: 'new' });
    const save = createAttachmentUploader({ uploader: { upload }, storeId: 'store', purchaseId: 'receipt' });
    await save([items[0]], vi.fn());
    expect(await save([{ id: 'a', file: new File(['new'], 'new.pdf') }], vi.fn())).toEqual(['new']);
    expect(upload).toHaveBeenCalledTimes(2);
  });
});

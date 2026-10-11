import { cropImage } from './crop-image';
describe('local image crop', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('rejects invalid rectangles before decoding/uploading', async () => {
    const decode = vi.fn();
    vi.stubGlobal('createImageBitmap', decode);
    await expect(
      cropImage(new File(['image'], 'x.png'), { left: 90, top: 0, width: 20, height: 100 }),
    ).rejects.toThrow('CROP_INVALID');
    expect(decode).not.toHaveBeenCalled();
  });
  it('produces a new cropped file and releases the decoded image', async () => {
    const bitmap = { width: 200, height: 100, close: vi.fn() };
    const drawImage = vi.fn();
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(bitmap));
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => ({ drawImage }),
      toBlob: (done: (blob: Blob) => void) => done(new Blob(['cropped'], { type: 'image/png' })),
    };
    const create = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(canvas as unknown as HTMLCanvasElement);
    const source = new File(['original'], 'x.jpg');
    const result = await cropImage(source, { left: 25, top: 10, width: 50, height: 50 });
    expect(canvas.width).toBe(100);
    expect(canvas.height).toBe(50);
    expect(drawImage).toHaveBeenCalledWith(bitmap, 50, 10, 100, 50, 0, 0, 100, 50);
    expect(result.name).toBe('x-crop.png');
    expect(bitmap.close).toHaveBeenCalledOnce();
    expect(source.name).toBe('x.jpg');
    create.mockRestore();
  });
});

import type { PickedFile } from '@dukani/ui-kit';

export type UploadedImage = PickedFile & { readonly fileId?: string };

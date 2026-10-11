export type FileSelectionError = 'maxFiles' | 'type' | 'size';

export type FileLimits = { accept: string; maxFiles: number; maxSizeMb: number; images?: boolean };

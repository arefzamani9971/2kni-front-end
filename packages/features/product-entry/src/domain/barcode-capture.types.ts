export type BarcodeOrigin = 'camera' | 'manual' | 'search';
export type BarcodeCapture = { schemaVersion: 1; code: string; origin: BarcodeOrigin };

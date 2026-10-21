/** Explicitly migrated features only; other features keep their current layout until reviewed. */
export const uiOrganizations = {
  'product-entry': {
    mode: 'sectioned',
    sections: ['identification', 'details', 'units', 'stock', 'pricing', 'bulk', 'attachments', 'review'],
  },
  purchasing: {
    mode: 'sectioned',
    sections: ['receipts', 'quick-receipt'],
  },
};

export const uiCategories = [
  'screens',
  'components',
  'hooks',
  'state',
  'presentation',
  'types',
  'constants',
  'schemas',
  'tests',
];

// Translation catalogs and bindings only. Extend with a documented responsibility, not a silent exception.
export const i18nFilePatterns = [/\.json$/, /^catalogs\.ts$/, /^types\.ts$/, /^use-.*-translations\.ts$/];

export function uiLocation(file) {
  const match = /^packages\/features\/([^/]+)\/src\/ui\/(.+)$/.exec(file);
  const config = match && uiOrganizations[match[1]];
  if (!config) return null;
  const parts = match[2].split('/');
  return { config, root: `packages/features/${match[1]}/src/ui/`, parts };
}

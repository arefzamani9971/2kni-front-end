/** Cell alignment of a suggestion column (logical, so RTL and LTR both read naturally). */
export const AUTOCOMPLETE_ALIGN = {
  start: 'text-start',
  center: 'text-center',
  end: 'text-end',
} as const;

/** The grid tracks shared by the header and every option row, so the columns line up. */
export const gridTracks = (widths: readonly (string | undefined)[]) =>
  widths.map((width) => width ?? 'minmax(0,1fr)').join(' ');

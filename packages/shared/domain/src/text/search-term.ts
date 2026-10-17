/**
 * Characters that count toward the autocomplete minimum: Unicode code points except spaces, ZWNJ/ZWJ and
 * combining marks, so «  ک » or a vowel sign alone never reaches it.
 */
export const searchTermLength = (input: string): number => [...input.replace(/[\s‌‍\p{M}]/gu, '')].length;

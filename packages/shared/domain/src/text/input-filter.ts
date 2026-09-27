/**
 * Character-level input filters. A field with a filter REJECTS an edit that contains a forbidden
 * character (the previous value is kept and a message is shown); it never strips characters silently,
 * so a wrong entry can never turn into another valid number or code (ui-guidelines 2.4.1).
 */
const DIGIT = '0-9۰-۹٠-٩';
// Persian letters; diacritics (tanvin…sukun, hamza above) via \p{Mn} so no combining mark sits literally in a class
const PERSIAN_LETTER = '\\u0621-\\u063A\\u0641-\\u064A\\u067E\\u0686\\u0698\\u06A9\\u06AF\\u06C0\\u06CC\\p{Mn}';
const LATIN_LETTER = 'A-Za-z';
const ZWNJ = '\\u200C';
const SPACE = ' ';
const PERSIAN_PUNCT = '،؛؟«»٫٬';
const COMMON_PUNCT = '.,:;!?()\\-/\'"';

export type InputFilterKind =
  | 'any'
  | 'digits'
  | 'decimal'
  | 'letters'
  | 'persian-letters'
  | 'persian'
  | 'latin-letters'
  | 'latin'
  | 'alphanumeric'
  | 'persian-alphanumeric'
  | 'email';

export type InputFilter = InputFilterKind | { readonly pattern: RegExp; readonly message: string };

const PATTERNS: Record<Exclude<InputFilterKind, 'any'>, RegExp> = {
  digits: new RegExp(`^[${DIGIT}]*$`, 'u'),
  decimal: new RegExp(`^[${DIGIT}]*([.٫][${DIGIT}]*)?$`, 'u'),
  letters: new RegExp(`^[${PERSIAN_LETTER}${LATIN_LETTER}${ZWNJ}${SPACE}]*$`, 'u'),
  'persian-letters': new RegExp(`^[${PERSIAN_LETTER}${ZWNJ}${SPACE}]*$`, 'u'),
  persian: new RegExp(`^[${PERSIAN_LETTER}${ZWNJ}${SPACE}${DIGIT}${PERSIAN_PUNCT}${COMMON_PUNCT}]*$`, 'u'),
  'latin-letters': new RegExp(`^[${LATIN_LETTER}${SPACE}]*$`, 'u'),
  latin: new RegExp(`^[${LATIN_LETTER}0-9${SPACE}${COMMON_PUNCT}@_+&#]*$`, 'u'),
  alphanumeric: new RegExp(`^[${PERSIAN_LETTER}${LATIN_LETTER}${DIGIT}${ZWNJ}${SPACE}]*$`, 'u'),
  'persian-alphanumeric': new RegExp(`^[${PERSIAN_LETTER}${DIGIT}${ZWNJ}${SPACE}]*$`, 'u'),
  email: /^[A-Za-z0-9@._+-]*$/,
};

export const INPUT_FILTER_MESSAGES: Record<Exclude<InputFilterKind, 'any'>, string> = {
  digits: 'فقط رقم وارد کنید.',
  decimal: 'فقط عدد وارد کنید؛ برای اعشار از ممیز استفاده کنید.',
  letters: 'فقط حروف وارد کنید.',
  'persian-letters': 'فقط حروف فارسی وارد کنید.',
  persian: 'فقط فارسی بنویسید.',
  'latin-letters': 'فقط حروف انگلیسی وارد کنید.',
  latin: 'فقط حروف و ارقام انگلیسی مجاز است.',
  alphanumeric: 'فقط حروف و رقم مجاز است.',
  'persian-alphanumeric': 'فقط حروف فارسی و رقم مجاز است.',
  email: 'فقط حروف انگلیسی، رقم و @ . _ + - مجاز است.',
};

export type FilterCheck = { readonly accepted: true } | { readonly accepted: false; readonly message: string };

/** Checks a whole candidate value (after typing, paste or autofill) against a filter. */
export const checkInputFilter = (filter: InputFilter | undefined, candidate: string): FilterCheck => {
  if (!filter || filter === 'any') return { accepted: true };
  if (typeof filter === 'object') {
    return filter.pattern.test(candidate) ? { accepted: true } : { accepted: false, message: filter.message };
  }
  return PATTERNS[filter].test(candidate)
    ? { accepted: true }
    : { accepted: false, message: INPUT_FILTER_MESSAGES[filter] };
};

/** `inputMode` hint that matches a filter (keyboard only; never a validator). */
export const inputModeFor = (filter: InputFilter | undefined): 'numeric' | 'decimal' | 'email' | 'text' => {
  if (filter === 'digits') return 'numeric';
  if (filter === 'decimal') return 'decimal';
  if (filter === 'email') return 'email';
  return 'text';
};

import type { PackagingRowIssue } from '../../domain/packagings';

/** Translation key of each package-name problem. */
export const PACKAGE_NAME_ERROR = {
  required: 'packageNameRequired',
  tooLong: 'packageNameTooLong',
  duplicate: 'packageNameDuplicate',
} as const satisfies Record<NonNullable<PackagingRowIssue['name']>, string>;

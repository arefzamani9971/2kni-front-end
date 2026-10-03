import type { PERMISSIONS } from './permission.constants';

export type Permission = (typeof PERMISSIONS)[number];

export type MemberRole = 'Owner' | 'Staff';

export type AccessContext = { readonly role: MemberRole; readonly permissions: readonly string[] };

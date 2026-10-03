import type { AccessContext, Permission } from './permission.types';
import { PERMISSIONS } from './permission.constants';

export const can = (ctx: AccessContext | null | undefined, permission: Permission): boolean =>
  !!ctx && (ctx.role === 'Owner' || ctx.permissions.includes(permission));

export const isPermission = (value: string): value is Permission =>
  (PERMISSIONS as readonly string[]).includes(value);

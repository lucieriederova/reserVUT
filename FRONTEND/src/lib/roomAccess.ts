import type { AppUser } from './api';

export type RoleCode = AppUser['role'];

export interface RoomPolicy {
  name: string;
  allowedRoles: RoleCode[];
}

export const DEFAULT_ROOM_POLICIES: RoomPolicy[] = [
  { name: 'Meeting Room', allowedRoles: ['STUDENT', 'CEO', 'GUIDE', 'HEAD_ADMIN'] },
  { name: 'Session Room', allowedRoles: ['CEO', 'GUIDE', 'HEAD_ADMIN'] },
  { name: 'The Stage', allowedRoles: ['CEO', 'GUIDE', 'HEAD_ADMIN'] },
  { name: 'The Aquarium', allowedRoles: ['STUDENT', 'CEO', 'HEAD_ADMIN'] },
  { name: 'Panda Room', allowedRoles: ['CEO', 'HEAD_ADMIN'] },
  { name: 'P159', allowedRoles: ['CEO', 'HEAD_ADMIN'] }
];

export const ROOM_POLICIES_STORAGE_KEY = 'inprofo_room_policies';

export const getRoomsForRole = (policies: RoomPolicy[], role: RoleCode) =>
  policies.filter((policy) => policy.allowedRoles.includes(role)).map((policy) => policy.name);

export const sanitizeRoomPolicies = (value: unknown): RoomPolicy[] => {
  if (!Array.isArray(value)) return DEFAULT_ROOM_POLICIES;

  const validRoles: RoleCode[] = ['STUDENT', 'CEO', 'GUIDE', 'HEAD_ADMIN'];
  const seen = new Set<string>();
  const normalized: RoomPolicy[] = [];

  for (const item of value) {
    const maybeName = (item as RoomPolicy)?.name;
    const maybeRoles = (item as RoomPolicy)?.allowedRoles;
    if (typeof maybeName !== 'string') continue;
    const name = maybeName.trim();
    if (!name || seen.has(name)) continue;
    if (!Array.isArray(maybeRoles)) continue;

    const roles = maybeRoles.filter((role): role is RoleCode => validRoles.includes(role));
    if (!roles.length) continue;
    seen.add(name);
    normalized.push({ name, allowedRoles: Array.from(new Set(roles)) });
  }

  return normalized.length ? normalized : DEFAULT_ROOM_POLICIES;
};

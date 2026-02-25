type RoleCode = 'STUDENT' | 'CEO' | 'GUIDE' | 'HEAD_ADMIN';

export interface RoomPolicy {
  name: string;
  allowedRoles: RoleCode[];
}

const VALID_ROLES: RoleCode[] = ['STUDENT', 'CEO', 'GUIDE', 'HEAD_ADMIN'];

const DEFAULT_POLICIES: RoomPolicy[] = [
  { name: 'Meeting Room', allowedRoles: ['STUDENT', 'CEO', 'GUIDE', 'HEAD_ADMIN'] },
  { name: 'Session Room', allowedRoles: ['CEO', 'GUIDE', 'HEAD_ADMIN'] },
  { name: 'The Stage', allowedRoles: ['CEO', 'GUIDE', 'HEAD_ADMIN'] },
  { name: 'The Aquarium', allowedRoles: ['STUDENT', 'CEO', 'HEAD_ADMIN'] },
  { name: 'Panda Room', allowedRoles: ['CEO', 'HEAD_ADMIN'] },
  { name: 'P159', allowedRoles: ['CEO', 'HEAD_ADMIN'] }
];

let roomPolicies: RoomPolicy[] = [...DEFAULT_POLICIES];

const sanitizePolicies = (input: unknown): RoomPolicy[] => {
  if (!Array.isArray(input)) return roomPolicies;

  const seen = new Set<string>();
  const normalized: RoomPolicy[] = [];
  for (const policy of input) {
    const maybeName = (policy as RoomPolicy)?.name;
    const maybeRoles = (policy as RoomPolicy)?.allowedRoles;
    if (typeof maybeName !== 'string') continue;
    const name = maybeName.trim();
    if (!name || seen.has(name)) continue;
    if (!Array.isArray(maybeRoles)) continue;

    const roles = maybeRoles.filter((role): role is RoleCode => VALID_ROLES.includes(role));
    if (!roles.length) continue;

    seen.add(name);
    normalized.push({ name, allowedRoles: Array.from(new Set(roles)) });
  }

  return normalized.length ? normalized : roomPolicies;
};

export const listRoomPolicies = () => roomPolicies;

export const replaceRoomPolicies = (nextPolicies: unknown) => {
  roomPolicies = sanitizePolicies(nextPolicies);
  return roomPolicies;
};

export const isRoomAllowedForRole = (roomName: string, role: RoleCode) =>
  roomPolicies.some((policy) => policy.name === roomName && policy.allowedRoles.includes(role));

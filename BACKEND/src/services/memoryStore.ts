import { randomUUID } from 'crypto';

type PrismaRole = 'STUDENT' | 'CEO' | 'GUIDE' | 'HEAD_ADMIN';

interface MemoryUser {
  id: string;
  email: string;
  vutId: string;
  role: PrismaRole;
  isVerified: boolean;
  createdAt: Date;
}

interface MemoryReservation {
  id: string;
  roomName: string;
  startTime: Date;
  endTime: Date;
  priorityLevel: number;
  type: string;
  userId: string;
  createdAt: Date;
}

const users: MemoryUser[] = [];
const reservations: MemoryReservation[] = [];

const buildVutId = (email: string) => {
  const prefix = email.split('@')[0]?.replace(/[^a-zA-Z0-9_.-]/g, '') || 'user';
  return `vut-${prefix}`;
};

export const upsertMemoryUser = (email: string, role: PrismaRole) => {
  const existing = users.find((user) => user.email === email);
  if (existing) {
    existing.role = role;
    existing.isVerified = role === 'STUDENT' || role === 'HEAD_ADMIN';
    return existing;
  }

  let vutId = buildVutId(email);
  let suffix = 1;
  while (users.some((user) => user.vutId === vutId)) {
    suffix += 1;
    vutId = `${buildVutId(email)}-${suffix}`;
  }

  const created: MemoryUser = {
    id: randomUUID(),
    email,
    vutId,
    role,
    isVerified: role === 'STUDENT' || role === 'HEAD_ADMIN',
    createdAt: new Date()
  };
  users.push(created);
  return created;
};

export const getMemoryUserById = (id: string) => users.find((user) => user.id === id) || null;

export const listMemoryReservations = () => {
  return reservations
    .slice()
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    .map((reservation) => ({
      ...reservation,
      user: users.find((user) => user.id === reservation.userId)
        ? {
            id: users.find((user) => user.id === reservation.userId)!.id,
            email: users.find((user) => user.id === reservation.userId)!.email,
            role: users.find((user) => user.id === reservation.userId)!.role
          }
        : null
    }));
};

export const createMemoryReservation = (input: {
  userId: string;
  roomName: string;
  startTime: Date;
  endTime: Date;
  priorityLevel: number;
  type: string;
}) => {
  const user = users.find((item) => item.id === input.userId);
  if (!user) {
    throw new Error('Uživatel neexistuje.');
  }

  const conflicts = reservations.filter(
    (reservation) =>
      reservation.roomName === input.roomName &&
      reservation.startTime < input.endTime &&
      reservation.endTime > input.startTime
  );

  if (conflicts.length > 0) {
    const maxExistingPriority = Math.max(...conflicts.map((reservation) => reservation.priorityLevel));
    if (input.priorityLevel <= maxExistingPriority) {
      throw new Error('Conflict: V tomto čase již existuje rezervace s vyšší nebo stejnou prioritou.');
    }
    for (const conflict of conflicts) {
      const index = reservations.findIndex((reservation) => reservation.id === conflict.id);
      if (index >= 0) reservations.splice(index, 1);
    }
  }

  const created: MemoryReservation = {
    id: randomUUID(),
    roomName: input.roomName,
    startTime: input.startTime,
    endTime: input.endTime,
    priorityLevel: input.priorityLevel,
    type: input.type,
    userId: input.userId,
    createdAt: new Date()
  };
  reservations.push(created);
  return {
    ...created,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  };
};

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createMemoryReservation, getMemoryUserById, listMemoryReservations } from '../services/memoryStore.js';
import { isRoomAllowedForRole } from '../services/roomPolicyStore.js';

const prisma = new PrismaClient();

export const createReservation = async (req: Request, res: Response) => {
  try {
    const { userId, roomId, roomName, startTime, endTime, priority, priorityLevel, title, type } = req.body;
    const resolvedRoomName = roomName || roomId;
    const resolvedPriorityLevel = Number(priorityLevel ?? priority ?? 1);
    const resolvedType = type || title || 'New Reservation';

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (!userId || !resolvedRoomName || !startTime || !endTime) {
      return res.status(400).json({
        error: "Chybí povinná data: userId, roomName/roomId, startTime, endTime."
      });
    }

    if (Number.isNaN(resolvedPriorityLevel)) {
      return res.status(400).json({ error: 'Neplatná hodnota priority.' });
    }

    let resolvedUserRole: 'STUDENT' | 'CEO' | 'GUIDE' | 'HEAD_ADMIN' | null = null;
    try {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
      if (!user) {
        return res.status(404).json({ error: 'Uživatel nebyl nalezen.' });
      }
      resolvedUserRole = user.role;
    } catch {
      const memoryUser = getMemoryUserById(userId);
      if (!memoryUser) {
        return res.status(404).json({ error: 'Uživatel nebyl nalezen.' });
      }
      resolvedUserRole = memoryUser.role;
    }

    if (!resolvedUserRole || !isRoomAllowedForRole(resolvedRoomName, resolvedUserRole)) {
      return res.status(403).json({ error: 'Role tohoto uživatele nemá oprávnění rezervovat tuto místnost.' });
    }

    // --- 1. VALIDACE: CONSTRAINT ENGINE (Zadání INPROFO) ---
    
    // Kontrola maximální délky (3 hodiny = 180 minut)
    const durationMs = end.getTime() - start.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    if (durationHours > 3) {
      return res.status(400).json({ 
        error: "Constraint Violation: Maximální délka rezervace jsou 3 hodiny." 
      });
    }

    if (durationHours <= 0) {
      return res.status(400).json({ error: "Neplatný časový rozsah." });
    }

    // --- 2. PRIORITY ENGINE: KONTROLA KOLIZÍ ---

    // Najdeme existující rezervace v tomto čase a místnosti
    try {
      const existingReservations = await prisma.reservation.findMany({
        where: {
          roomName: resolvedRoomName,
          AND: [
            { startTime: { lt: end } },
            { endTime: { gt: start } }
          ]
        }
      });

      if (existingReservations.length > 0) {
        // Zjistíme nejvyšší prioritu existující rezervace
        const maxExistingPriority = Math.max(...existingReservations.map(r => r.priorityLevel));

        // Pokud má nová rezervace vyšší prioritu (např. tvůj HEAD_ADMIN Level 4)
        if (resolvedPriorityLevel > maxExistingPriority) {
          // Smažeme kolidující rezervace s nižší prioritou (Pre-emption)
          await prisma.reservation.deleteMany({
            where: {
              id: { in: existingReservations.map(r => r.id) }
            }
          });
          console.log(`Priority Override: Rezervace uživatele ${userId} přebila původní bloky.`);
        } else {
          return res.status(409).json({
            error: "Conflict: V tomto čase již existuje rezervace s vyšší nebo stejnou prioritou."
          });
        }
      }

      // --- 3. ULOŽENÍ REZERVACE ---
      const newReservation = await prisma.reservation.create({
        data: {
          userId,
          roomName: resolvedRoomName,
          startTime: start,
          endTime: end,
          priorityLevel: resolvedPriorityLevel,
          type: resolvedType
        }
      });

      return res.status(201).json(newReservation);
    } catch {
      try {
        const memoryReservation = createMemoryReservation({
          userId,
          roomName: resolvedRoomName,
          startTime: start,
          endTime: end,
          priorityLevel: resolvedPriorityLevel,
          type: resolvedType
        });
        return res.status(201).json(memoryReservation);
      } catch (memoryError: any) {
        if (memoryError?.message?.startsWith('Conflict:')) {
          return res.status(409).json({ error: memoryError.message });
        }
        return res.status(400).json({ error: memoryError?.message || 'Neznámá chyba rezervace.' });
      }
    }

  } catch (error: any) {
    console.error("Reservation Error:", error);
    return res.status(500).json({ error: "Interní chyba serveru při ukládání rezervace." });
  }
};

export const listReservations = async (_req: Request, res: Response) => {
  try {
    try {
      const reservations = await prisma.reservation.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          startTime: 'asc'
        }
      });
      return res.status(200).json(reservations);
    } catch {
      return res.status(200).json(listMemoryReservations());
    }
  } catch (error) {
    return res.status(500).json({ error: 'Chyba při načítání rezervací.' });
  }
};

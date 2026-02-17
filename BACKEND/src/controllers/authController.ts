import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { upsertMemoryUser } from '../services/memoryStore.js';

const prisma = new PrismaClient();

const mapRoleToPrisma = (role: string) => {
  switch (role) {
    case 'Student':
    case 'STUDENT':
      return 'STUDENT';
    case 'CEO':
      return 'CEO';
    case 'Guide':
    case 'GUIDE':
      return 'GUIDE';
    case 'Head Admin':
    case 'HEAD_ADMIN':
      return 'HEAD_ADMIN';
    default:
      return null;
  }
};

export const registerUser = async (req: Request, res: Response) => {
  const { vutId, email, role } = req.body;

  try {
    // Ověření, zda jde o VUT mail [cite: 15, 22, 37, 45]
    if (!email.endsWith('@vut.cz') && !email.endsWith('@vutbr.cz')) {
      return res.status(400).json({ error: "Je vyžadován platný VUT mail." });
    }

    const newUser = await prisma.user.create({
      data: {
        vutId,
        email,
        role,
        // CEO a Guide vyžadují verifikaci [cite: 25, 39, 87]
        isVerified: role === 'STUDENT' ? true : false 
      }
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: "Chyba při registraci uživatele." });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body as { email?: string; role?: string };

    if (!email || !role) {
      return res.status(400).json({ error: 'Chybí email nebo role.' });
    }

    if (!email.endsWith('@vut.cz') && !email.endsWith('@vutbr.cz')) {
      return res.status(400).json({ error: 'Je vyžadován platný VUT mail.' });
    }

    const prismaRole = mapRoleToPrisma(role);
    if (!prismaRole) {
      return res.status(400).json({ error: 'Neplatná role.' });
    }

    try {
      const existingByEmail = await prisma.user.findUnique({ where: { email } });
      if (existingByEmail) {
        const updated = await prisma.user.update({
          where: { email },
          data: {
            role: prismaRole,
            isVerified: prismaRole === 'STUDENT' || prismaRole === 'HEAD_ADMIN'
          }
        });
        return res.status(200).json(updated);
      }

      const user = await prisma.user.create({
        data: {
          email,
          vutId: `vut-${Date.now()}`,
          role: prismaRole,
          isVerified: prismaRole === 'STUDENT' || prismaRole === 'HEAD_ADMIN'
        }
      });

      return res.status(201).json(user);
    } catch {
      const memoryUser = upsertMemoryUser(email, prismaRole as 'STUDENT' | 'CEO' | 'GUIDE' | 'HEAD_ADMIN');
      return res.status(200).json(memoryUser);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Chyba při přihlášení uživatele.' });
  }
};

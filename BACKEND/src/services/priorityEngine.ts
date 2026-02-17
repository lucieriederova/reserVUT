import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

// Definice prioritních vah přímo (aby nebyl problém s enumem Role z Prisma)
const PRIORITY_MAP: Record<string, number> = {
  STUDENT: 1,    // Level 1 (Low)
  CEO: 2,        // Level 2 (Mid)
  GUIDE: 3,      // Level 3 (High)
  HEAD_ADMIN: 4  // Level 4 (Critical)
};

export const resolveConflict = async (newUserId: string, existingResId: string) => {
  const newUser = await prisma.user.findUnique({ where: { id: newUserId } });
  const existingRes = await prisma.reservation.findUnique({ 
    where: { id: existingResId },
    include: { user: true }
  });

  if (!newUser || !existingRes) throw new Error("User or Reservation not found");

  // Pokud má nový uživatel vyšší prioritu, zrušíme starou rezervaci
  const newUserPriority = PRIORITY_MAP[newUser.role] || 0;
  const existingUserPriority = PRIORITY_MAP[existingRes.user.role] || 0;

  if (newUserPriority > existingUserPriority) {
    // Smazání původní rezervace (Pre-emption)
    await prisma.reservation.delete({ where: { id: existingResId } });
    
    // Logování do Audit Logu pro transparentnost
    await prisma.auditLog.create({
      data: {
        action: "PRIORITY_OVERRIDE",
        canceledBookingId: existingResId,
        reason: `Role ${newUser.role} přebila rezervaci role ${existingRes.user.role}`,
        adminId: newUserId
      }
    });
    
    return true; // Konflikt vyřešen (původní smazána)
  }

  return false; // Konflikt trvá (nový uživatel nemá dostatečnou prioritu)
};
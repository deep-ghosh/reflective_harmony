import { prisma } from "@/lib/db";
import { CaseStatus } from "@prisma/client";

/**
 * Auto-assigns a case to the counselor with the lowest case load
 * Uses round-robin distribution based on current workload
 */
export async function autoAssignCase(caseId: string): Promise<string | null> {
  try {
    // Find active counselor with lowest case load
    const availableCounselor = await prisma.counselor.findFirst({
      where: {
        isActive: true,
        currentCaseLoad: {
          lt: prisma.counselor.fields.maxCaseLoad, // Less than max load
        },
      },
      orderBy: [
        { currentCaseLoad: "asc" }, // Lowest load first
        { createdAt: "asc" }, // Oldest counselor as tiebreaker
      ],
    });

    if (!availableCounselor) {
      console.warn("No available counselors for case assignment");
      return null;
    }

    // Assign case and increment counselor's case load
    await prisma.$transaction([
      // Update case
      prisma.case.update({
        where: { id: caseId },
        data: {
          assignedToId: availableCounselor.id,
          assignedAt: new Date(),
          status: CaseStatus.ASSIGNED,
        },
      }),
      // Increment counselor's case load
      prisma.counselor.update({
        where: { id: availableCounselor.id },
        data: {
          currentCaseLoad: {
            increment: 1,
          },
        },
      }),
    ]);

    console.log(
      `Case ${caseId} auto-assigned to ${availableCounselor.fullName}`
    );
    return availableCounselor.id;
  } catch (error) {
    console.error("Auto-assignment failed:", error);
    return null;
  }
}

/**
 * Decrements counselor's case load when case is resolved
 */
export async function decrementCaseLoad(counselorId: string): Promise<void> {
  await prisma.counselor.update({
    where: { id: counselorId },
    data: {
      currentCaseLoad: {
        decrement: 1,
      },
    },
  });
}

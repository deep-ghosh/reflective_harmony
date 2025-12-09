import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/middleware";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const user = await requireAuth();
    const { caseId } = await params;

    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        sessionNotes: {
          include: {
            counselor: {
              select: {
                fullName: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Check if case is assigned to current counselor
    if (caseData.assignedToId !== user.userId) {
      return NextResponse.json(
        { error: "Access denied - case not assigned to you" },
        { status: 403 }
      );
    }

    return NextResponse.json({ case: caseData });
  } catch (error) {
    console.error("Get case error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

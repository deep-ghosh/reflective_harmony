import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/middleware";
import { CaseStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as CaseStatus | null;

    // Counselors only see their assigned cases
    const cases = await prisma.case.findMany({
      where: {
        assignedToId: user.userId,
        ...(status && { status }),
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: { sessionNotes: true },
        },
      },
      orderBy: [{ riskLevel: "desc" }, { escalatedAt: "asc" }],
    });

    return NextResponse.json({ cases });
  } catch (error) {
    console.error("Get cases error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

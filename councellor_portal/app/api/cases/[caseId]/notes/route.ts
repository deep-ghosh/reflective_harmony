import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/middleware";
import { decrementCaseLoad } from "@/lib/case-assignment";
import { CaseStatus } from "@prisma/client";

const NoteSchema = z.object({
  noteContent: z.string().min(10),
  actionTaken: z.string().optional(),
  followUpDate: z.string().datetime().optional(),
  markResolved: z.boolean().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params; // ✅ MUST await params!
    const user = await requireAuth();
    const body = await req.json();
    const data = NoteSchema.parse(body);

    // Verify case belongs to this counselor
    const existingCase = await prisma.case.findUnique({
      where: { id: caseId },
      select: { assignedToId: true },
    });

    if (!existingCase || existingCase.assignedToId !== user.userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const note = await tx.sessionNote.create({
        data: {
          caseId: caseId,
          counselorId: user.userId,
          noteContent: data.noteContent,
          actionTaken: data.actionTaken,
          followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        },
      });

      if (data.markResolved) {
        await tx.case.update({
          where: { id: caseId },
          data: {
            status: CaseStatus.RESOLVED,
            resolvedAt: new Date(),
          },
        });

        // Decrement counselor's case load
        await decrementCaseLoad(user.userId);
      }

      return note;
    });

    return NextResponse.json({ note: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Create note error:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}

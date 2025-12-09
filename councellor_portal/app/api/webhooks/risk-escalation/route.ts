import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { autoAssignCase } from "@/lib/case-assignment";

const EscalationSchema = z.object({
  studentId: z.string(),
  studentName: z.string(),
  studentEmail: z.string(),
  riskScore: z.number(),
  riskLevel: z.enum(["MODERATE", "HIGH", "CRITICAL"]),
  triggerType: z.string(),
  emotionSnapshot: z.record(z.any()),
  assessmentData: z.record(z.any()).optional(),
  timestamp: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature
    const apiKey = req.headers.get("x-api-key");
    if (apiKey !== process.env.BACKEND_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = EscalationSchema.parse(body);

    // Check for existing active case
    const existingCase = await prisma.case.findFirst({
      where: {
        studentId: data.studentId,
        status: { in: ["PENDING", "ASSIGNED", "IN_PROGRESS"] },
      },
    });

    let caseRecord;

    if (existingCase) {
      // Update existing case
      caseRecord = await prisma.case.update({
        where: { id: existingCase.id },
        data: {
          riskScore: data.riskScore,
          riskLevel: data.riskLevel,
          emotionSnapshot: data.emotionSnapshot,
          assessmentData: data.assessmentData,
        },
      });
    } else {
      // Create new case
      caseRecord = await prisma.case.create({
        data: {
          studentId: data.studentId,
          studentName: data.studentName,
          studentEmail: data.studentEmail,
          riskScore: data.riskScore,
          riskLevel: data.riskLevel,
          triggerType: data.triggerType,
          emotionSnapshot: data.emotionSnapshot,
          assessmentData: data.assessmentData,
        },
      });

      // Auto-assign to available counselor
      const assignedCounselorId = await autoAssignCase(caseRecord.id);

      if (assignedCounselorId) {
        console.log(
          `Case ${caseRecord.id} auto-assigned to counselor ${assignedCounselorId}`
        );
      } else {
        console.warn(`No counselors available for case ${caseRecord.id}`);
      }
    }

    return NextResponse.json({
      success: true,
      caseId: caseRecord.id,
      action: existingCase ? "updated" : "created",
      assigned: !existingCase,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process escalation" },
      { status: 500 }
    );
  }
}

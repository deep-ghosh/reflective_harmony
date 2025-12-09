import { getCurrentUser } from "@/lib/auth/middleware";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import SessionNoteForm from "@/components/SessionNoteForm";
import EmotionChart from "@/components/EmotionChart";
import { formatTimeAgo } from "@/lib/utils";
import {
  Calendar,
  Mail,
  User,
  TrendingUp,
  FileText,
  Clock,
  AlertCircle,
  Activity,
} from "lucide-react";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      assignedTo: { select: { id: true, fullName: true, email: true } },
      sessionNotes: {
        include: { counselor: { select: { fullName: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!caseData) {
    return (
      <main className="p-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Case not found</p>
        </div>
      </main>
    );
  }

  if (caseData.assignedToId !== user.userId) {
    return (
      <main className="p-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-xl text-red-600">
            Access denied - case not assigned to you
          </p>
        </div>
      </main>
    );
  }

  // Risk level styling
  const getRiskStyles = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return {
          badge: "bg-red-100 text-red-700 border-2 border-red-300",
          bg: "bg-red-50",
          ring: "ring-red-200",
        };
      case "HIGH":
        return {
          badge: "bg-orange-100 text-orange-700 border-2 border-orange-300",
          bg: "bg-orange-50",
          ring: "ring-orange-200",
        };
      case "MODERATE":
        return {
          badge: "bg-yellow-100 text-yellow-700 border-2 border-yellow-300",
          bg: "bg-yellow-50",
          ring: "ring-yellow-200",
        };
      default:
        return {
          badge: "bg-gray-100 text-gray-700 border-2 border-gray-300",
          bg: "bg-gray-50",
          ring: "ring-gray-200",
        };
    }
  };

  const riskStyles = getRiskStyles(caseData.riskLevel);

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Card - Student Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left: Student Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-5">
                {caseData.studentName}
              </h1>

              {/* Contact Details - Clean Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className="flex items-center gap-3 text-gray-700 bg-gray-50 px-4 py-3 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium">
                    {caseData.studentEmail}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 bg-gray-50 px-4 py-3 rounded-lg">
                  <User className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium">
                    ID: {caseData.studentId}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 bg-gray-50 px-4 py-3 rounded-lg sm:col-span-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium">
                    Escalated {formatTimeAgo(caseData.escalatedAt)}
                  </span>
                </div>
              </div>

              {/* Status Row - Pills */}
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  {caseData.status.replace("_", " ")}
                </div>
                <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-medium border border-purple-200">
                  <User className="w-4 h-4" />
                  {caseData.assignedTo?.fullName}
                </div>
              </div>
            </div>

            {/* Right: Risk Badge & Score */}
            <div className="flex lg:flex-col items-center lg:items-end gap-4 lg:gap-3">
              <div
                className={`${riskStyles.badge} px-8 py-3 rounded-2xl text-lg font-bold uppercase tracking-wider shadow-sm`}
              >
                {caseData.riskLevel}
              </div>
              <div className="text-center lg:text-right bg-gray-50 px-8 py-4 rounded-2xl border-2 border-gray-200">
                <div className="text-6xl font-extrabold text-gray-900 leading-none">
                  {caseData.riskScore.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500 mt-2 font-medium uppercase tracking-wide">
                  Risk Score
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emotion Analysis - Clean White Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Emotion Analysis
            </h2>
          </div>
          <EmotionChart
            data={caseData.emotionSnapshot as Record<string, number>}
          />
        </div>

        {/* Assessment Results - FIXED: Light Background */}
        {caseData.assessmentData && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Assessment Results
              </h2>
            </div>
            {/* FIXED: Changed to light background with proper contrast */}
            <div className="bg-linear-to-br from-gray-50 to-blue-50 rounded-xl p-6 border-2 border-gray-200">
              <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(caseData.assessmentData, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Add Session Note */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Add Session Note
            </h2>
          </div>
          <SessionNoteForm caseId={caseData.id} />
        </div>

        {/* Session History */}
        {caseData.sessionNotes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Session History
              </h2>
            </div>
            <div className="space-y-4">
              {caseData.sessionNotes.map((note) => (
                <div
                  key={note.id}
                  className="border-l-4 border-blue-500 bg-linear-to-r from-blue-50 to-transparent rounded-r-xl p-6 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">
                        {note.counselor.fullName}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-2 mt-1.5">
                        <Calendar className="w-4 h-4" />
                        {new Date(note.createdAt).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-800 leading-relaxed mb-4 text-base">
                    {note.noteContent}
                  </p>

                  {note.actionTaken && (
                    <div className="bg-blue-100 border-l-4 border-blue-500 rounded-r-lg p-4 mb-3">
                      <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
                        Action Taken
                      </p>
                      <p className="text-sm text-blue-800 font-medium">
                        {note.actionTaken}
                      </p>
                    </div>
                  )}

                  {note.followUpDate && (
                    <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-lg text-sm font-semibold border border-amber-300">
                      <Clock className="w-4 h-4" />
                      <span>
                        Follow-up:{" "}
                        {new Date(note.followUpDate).toLocaleDateString(
                          "en-US",
                          {
                            dateStyle: "medium",
                          }
                        )}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

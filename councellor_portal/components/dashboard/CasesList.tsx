// components/dashboard/CasesList.tsx

import Link from "next/link";
import { Case } from "@prisma/client";
import { Clock, ArrowRight } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

interface CasesListProps {
  cases: (Case & {
    _count?: {
      sessionNotes: number;
    };
  })[];
}

export default function CasesList({ cases }: CasesListProps) {
  const getRiskBadgeClass = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "MODERATE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const criticalCases = cases.filter((c) => c.riskLevel === "CRITICAL");
  const highCases = cases.filter((c) => c.riskLevel === "HIGH");
  const moderateCases = cases.filter((c) => c.riskLevel === "MODERATE");

  return (
    <div className="space-y-6">
      {/* Critical Cases */}
      {criticalCases.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-red-50 border-b border-red-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-red-900 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Critical Priority ({criticalCases.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {criticalCases.map((c) => (
              <CaseRow key={c.id} case={c} />
            ))}
          </div>
        </div>
      )}

      {/* High Priority Cases */}
      {highCases.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-orange-50 border-b border-orange-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-orange-900">
              High Priority ({highCases.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {highCases.map((c) => (
              <CaseRow key={c.id} case={c} />
            ))}
          </div>
        </div>
      )}

      {/* Moderate Cases */}
      {moderateCases.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-yellow-50 border-b border-yellow-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-yellow-900">
              Moderate Priority ({moderateCases.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {moderateCases.map((c) => (
              <CaseRow key={c.id} case={c} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {cases.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No active cases
          </h3>
          <p className="text-gray-600">
            New cases will appear here when assigned to you
          </p>
        </div>
      )}
    </div>
  );
}

function CaseRow({
  case: c,
}: {
  case: Case & { _count?: { sessionNotes: number } };
}) {
  const getRiskBadgeClass = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "MODERATE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Link
      href={`/cases/${c.id}`}
      className="block p-6 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900 text-lg">
              {c.studentName}
            </h3>
            <span className={`badge border ${getRiskBadgeClass(c.riskLevel)}`}>
              {c.riskLevel}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{c.studentEmail}</p>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatTimeAgo(c.escalatedAt)}
            </span>
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
              {c.triggerType.replace("_", " ")}
            </span>
            {c._count && c._count.sessionNotes > 0 && (
              <span className="text-gray-600">
                {c._count.sessionNotes} note
                {c._count.sessionNotes !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-gray-500">Risk Score</p>
            <p className="text-2xl font-bold text-gray-900">
              {c.riskScore.toFixed(0)}
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </Link>
  );
}

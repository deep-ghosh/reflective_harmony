// components/CaseCard.tsx

import Link from "next/link";
import { Case } from "@prisma/client";
import { formatTimeAgo } from "@/lib/utils";
import { Clock, FileText, TrendingUp } from "lucide-react";

type CaseCardProps = {
  case: Case & {
    _count?: {
      sessionNotes: number;
    };
  };
};

export default function CaseCard({ case: c }: CaseCardProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-700",
          badge: "bg-red-100 text-red-800",
        };
      case "HIGH":
        return {
          bg: "bg-orange-50",
          border: "border-orange-200",
          text: "text-orange-700",
          badge: "bg-orange-100 text-orange-800",
        };
      case "MODERATE":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-700",
          badge: "bg-yellow-100 text-yellow-800",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-700",
          badge: "bg-gray-100 text-gray-800",
        };
    }
  };

  const colors = getRiskColor(c.riskLevel);

  return (
    <Link href={`/cases/${c.id}`}>
      <div
        className={`${colors.bg} border-2 ${colors.border} rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-lg truncate">
              {c.studentName}
            </h3>
            <p className="text-sm text-gray-600 truncate">{c.studentEmail}</p>
          </div>
          <span className={`badge ${colors.badge} ml-2`}>
            {c.riskScore.toFixed(0)}
          </span>
        </div>

        {/* Risk Level Badge */}
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className={`w-4 h-4 ${colors.text}`} />
          <span className={`text-sm font-medium ${colors.text}`}>
            {c.riskLevel} PRIORITY
          </span>
        </div>

        {/* Metadata */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{formatTimeAgo(c.escalatedAt)}</span>
          </div>

          {c._count && c._count.sessionNotes > 0 && (
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>
                {c._count.sessionNotes} session note
                {c._count.sessionNotes !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <span
            className={`inline-block px-2 py-1 text-xs rounded ${
              c.status === "PENDING"
                ? "bg-yellow-100 text-yellow-800"
                : c.status === "ASSIGNED"
                ? "bg-blue-100 text-blue-800"
                : c.status === "IN_PROGRESS"
                ? "bg-purple-100 text-purple-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {c.status.replace("_", " ")}
          </span>
        </div>
      </div>
    </Link>
  );
}

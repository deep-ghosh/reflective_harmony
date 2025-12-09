// components/dashboard/RecentActivity.tsx

import { prisma } from "@/lib/db";
import { Clock } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

interface RecentActivityProps {
  userId: string;
}

export default async function RecentActivity({ userId }: RecentActivityProps) {
  const recentNotes = await prisma.sessionNote.findMany({
    where: { counselorId: userId },
    include: {
      case: {
        select: {
          studentName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>

      {recentNotes.length > 0 ? (
        <div className="space-y-4">
          {recentNotes.map((note) => (
            <div key={note.id} className="flex gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Session with {note.case.studentName}
                </p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(note.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          No recent activity
        </p>
      )}
    </div>
  );
}

// app/(dashboard)/cases/page.tsx

import { getCurrentUser } from "@/lib/auth/middleware";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import CaseCard from "@/components/CaseCard";
import { Search, Filter } from "lucide-react";

export default async function AllCasesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const cases = await prisma.case.findMany({
    where: { assignedToId: user.userId },
    include: {
      _count: {
        select: { sessionNotes: true },
      },
    },
    orderBy: [
      { status: "asc" },
      { riskLevel: "desc" },
      { escalatedAt: "desc" },
    ],
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Cases</h1>
          <p className="text-gray-600 mt-1">
            {cases.length} total case{cases.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cases.map((c) => (
          <CaseCard key={c.id} case={c} />
        ))}
      </div>

      {/* Empty State */}
      {cases.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">No cases assigned yet</p>
        </div>
      )}
    </div>
  );
}

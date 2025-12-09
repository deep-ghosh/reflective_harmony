// app/(dashboard)/dashboard/page.tsx

import { getCurrentUser } from "@/lib/auth/middleware";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import StatsCards from "@/components/dashboard/StatsCards";
import CasesList from "@/components/dashboard/CasesList";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Fetch counselor's cases
  const cases = await prisma.case.findMany({
    where: {
      assignedToId: user.userId,
      status: { in: ["PENDING", "ASSIGNED", "IN_PROGRESS"] },
    },
    include: {
      _count: {
        select: { sessionNotes: true },
      },
    },
    orderBy: [{ riskLevel: "desc" }, { escalatedAt: "asc" }],
  });

  // Get counselor info with case load
  const counselor = await prisma.counselor.findUnique({
    where: { id: user.userId },
    select: {
      currentCaseLoad: true,
      maxCaseLoad: true,
    },
  });

  // Calculate stats
  const criticalCount = cases.filter((c) => c.riskLevel === "CRITICAL").length;
  const highCount = cases.filter((c) => c.riskLevel === "HIGH").length;
  const totalActive = cases.length;
  const caseLoadPercentage = counselor
    ? Math.round((counselor.currentCaseLoad / counselor.maxCaseLoad) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.fullName.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your cases today
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards
        totalActive={totalActive}
        critical={criticalCount}
        high={highCount}
        caseLoadPercentage={caseLoadPercentage}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cases List (Left - 2 columns) */}
        <div className="lg:col-span-2">
          <CasesList cases={cases} />
        </div>

        {/* Sidebar (Right - 1 column) */}
        <div className="space-y-6">
          <QuickActions />
          <RecentActivity userId={user.userId} />
        </div>
      </div>
    </div>
  );
}

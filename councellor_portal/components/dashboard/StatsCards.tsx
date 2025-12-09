// components/dashboard/StatsCards.tsx

import { TrendingUp, AlertTriangle, Users, Activity } from "lucide-react";

interface StatsCardsProps {
  totalActive: number;
  critical: number;
  high: number;
  caseLoadPercentage: number;
}

export default function StatsCards({
  totalActive,
  critical,
  high,
  caseLoadPercentage,
}: StatsCardsProps) {
  const stats = [
    {
      name: "Active Cases",
      value: totalActive,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Critical Priority",
      value: critical,
      icon: AlertTriangle,
      color: "from-red-500 to-red-600",
      textColor: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      name: "High Priority",
      value: high,
      icon: TrendingUp,
      color: "from-orange-500 to-orange-600",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      name: "Capacity Used",
      value: `${caseLoadPercentage}%`,
      icon: Activity,
      color: "from-green-500 to-green-600",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stat.value}
              </p>
            </div>
            <div
              className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}
            >
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

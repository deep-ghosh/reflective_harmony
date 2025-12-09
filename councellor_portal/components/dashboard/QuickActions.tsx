// components/dashboard/QuickActions.tsx

import { FileText, Calendar, MessageSquare, Download } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      name: "Export Report",
      icon: Download,
      color: "text-blue-600 bg-blue-50",
    },
    {
      name: "Schedule Session",
      icon: Calendar,
      color: "text-green-600 bg-green-50",
    },
    {
      name: "Send Message",
      icon: MessageSquare,
      color: "text-purple-600 bg-purple-50",
    },
    {
      name: "View Guidelines",
      icon: FileText,
      color: "text-orange-600 bg-orange-50",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.name}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <div
              className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}
            >
              <action.icon className="w-5 h-5" />
            </div>
            <span className="font-medium text-gray-700">{action.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

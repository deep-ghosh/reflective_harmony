// components/EmotionChart.tsx

"use client";

interface EmotionChartProps {
  data: Record<string, number>;
}

export default function EmotionChart({ data }: EmotionChartProps) {
  const emotions = Object.entries(data).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.round((value as number) * 100),
    color: getEmotionColor(name),
  }));

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {emotions.map((emotion) => (
        <div key={emotion.name} className="text-center">
          <div className="mb-2">
            <svg className="w-full h-32" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={emotion.color}
                strokeWidth="10"
                strokeDasharray={`${(emotion.value / 100) * 251.2} 251.2`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
              <text
                x="50"
                y="50"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-2xl font-bold"
                fill={emotion.color}
              >
                {emotion.value}%
              </text>
            </svg>
          </div>
          <p className="font-medium text-gray-900">{emotion.name}</p>
        </div>
      ))}
    </div>
  );
}

function getEmotionColor(emotion: string): string {
  const colors: Record<string, string> = {
    joy: "#10b981",
    sadness: "#3b82f6",
    anxiety: "#f59e0b",
    anger: "#ef4444",
    fear: "#8b5cf6",
    neutral: "#6b7280",
  };
  return colors[emotion.toLowerCase()] || "#6b7280";
}

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface AssessmentVolumeChartProps {
  data: { date: string; count: number; highRisk: number }[];
}

export const AssessmentVolumeChart: React.FC<AssessmentVolumeChartProps> = ({
  data,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        No assessment volume data available
      </div>
    );
  }

  // Format dates for display (e.g. "Oct 12")
  const formattedData = data.map((d) => {
    const parts = d.date.split("-");
    const label = parts.length === 3 ? `${parts[1]}/${parts[2]}` : d.date;
    return {
      ...d,
      displayDate: label,
    };
  });

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 11, fill: "#64748b" }}
            stroke="#cbd5e1"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#64748b" }}
            stroke="#cbd5e1"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
          <Line
            type="monotone"
            dataKey="count"
            name="Total Triage Submissions"
            stroke="#0A84FF"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#0A84FF" }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="highRisk"
            name="High Urgency Submissions"
            stroke="#DC2626"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={{ r: 3, fill: "#DC2626" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

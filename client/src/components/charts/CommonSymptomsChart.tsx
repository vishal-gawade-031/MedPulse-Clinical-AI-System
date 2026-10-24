import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface CommonSymptomsChartProps {
  data: { symptom: string; count: number }[];
}

export const CommonSymptomsChart: React.FC<CommonSymptomsChartProps> = ({
  data,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        No symptom frequency data available
      </div>
    );
  }

  // Format symptom label for readability
  const formattedData = data.map((d) => ({
    ...d,
    formattedName: d.symptom.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
          <YAxis
            type="category"
            dataKey="formattedName"
            tick={{ fontSize: 11, fill: "#334155" }}
            width={120}
          />
          <Tooltip
            formatter={(value: any) => [`${value} Patients`, "Frequency"]}
            contentStyle={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="count" fill="#0A84FF" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// client/src/components/ExpenseTracker/charts/CategoryPieChart.jsx
import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { CHART_COLORS } from "../../../utils/constants";

const CategoryPieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-slate-300 to-gray-400 rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-gray-700">
        📊 Graphique des dépenses par catégorie
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value.toFixed(0)}€`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryPieChart;

// MetricCard.jsx
import React from "react";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";

export default function MetricCard({ title, value, trend }) {
  const isPositive = trend?.startsWith("+");
  return (
    <div className="metric-card">
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        {trend && (
          <span className={`metric-trend ${isPositive ? "positive" : "negative"}`}>
            {isPositive ? <FiArrowUp /> : <FiArrowDown />} {trend}
          </span>
        )}
      </div>
      <div className="metric-value">{value}</div>
    </div>
  );
}

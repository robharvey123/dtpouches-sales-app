"use client";

import * as React from "react";

type Props = {
  label: string;
  value: string | number;
  helpText?: string;
};

export function KPI({ label, value, helpText }: Props) {
  return (
    <div
      style={{
        padding: "16px",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        background: "#fff",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
      {helpText ? (
        <div style={{ color: "#6b7280", fontSize: 12, marginTop: 6 }}>{helpText}</div>
      ) : null}
    </div>
  );
}

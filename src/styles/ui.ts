import type { CSSProperties } from "react";

export const colors = {
  navy: "#0b1736",
  navyHover: "#14224d",
  bg: "#f3f4f6",
  card: "#ffffff",
  border: "#e5e7eb",
  text: "#111827",
  subtext: "#6b7280",
  muted: "#f8fafc",
  dangerBg: "#fef2f2",
  dangerBorder: "#fecaca",
  dangerText: "#b91c1c",
};

export const ui = {
  pageTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: colors.text,
    margin: "0 0 16px",
  } as CSSProperties,

  card: {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 16,
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  } as CSSProperties,

  primaryButton: {
    padding: "12px 18px",
    borderRadius: 12,
    border: "none",
    background: colors.navy,
    color: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
  } as CSSProperties,

  secondaryButton: {
    padding: "12px 18px",
    borderRadius: 12,
    border: `1px solid #cbd5e1`,
    background: "#e5e7eb",
    color: "#111827",
    fontWeight: 600,
    cursor: "pointer",
  } as CSSProperties,

  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: `1px solid #d1d5db`,
    outline: "none",
    fontSize: 15,
    boxSizing: "border-box",
    color: "#111827",
    background: "#ffffff",
  } as CSSProperties,

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    zIndex: 9999,
  } as CSSProperties,

  modalCard: {
    width: "100%",
    maxWidth: 760,
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#ffffff",
    borderRadius: 20,
    boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
    border: `1px solid ${colors.border}`,
  } as CSSProperties,
};
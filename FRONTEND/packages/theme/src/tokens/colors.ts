/**
 * Paleta clara (light) do OpSafe.
 * Focada em painel/dashboard, não em landing page.
 */
export const opsafeLightColors = {
  background: "#F9FAFB",
  foreground: "#020617",

  card: "#FFFFFF",
  cardForeground: "#020617",

  popover: "#FFFFFF",
  popoverForeground: "#020617",

  primary: "#0F172A",
  primaryForeground: "#F9FAFB",

  secondary: "#E5E7EB",
  secondaryForeground: "#111827",

  muted: "#E5E7EB",
  mutedForeground: "#4B5563",

  accent: "#EFF6FF",
  accentForeground: "#0F172A",

  border: "#E5E7EB",
  input: "#E5E7EB",
  ring: "#0EA5E9",

  destructive: "#EF4444",
  destructiveForeground: "#FEF2F2",

  success: "#22C55E",
  successForeground: "#052E16",

  warning: "#EAB308",
  warningForeground: "#422006"
} as const;

/**
 * Paleta escura (dark) do OpSafe.
 */
export const opsafeDarkColors = {
  background: "#020617",
  foreground: "#F9FAFB",

  card: "#020617",
  cardForeground: "#F9FAFB",

  popover: "#020617",
  popoverForeground: "#F9FAFB",

  primary: "#38BDF8",
  primaryForeground: "#0F172A",

  secondary: "#111827",
  secondaryForeground: "#E5E7EB",

  muted: "#020617",
  mutedForeground: "#9CA3AF",

  accent: "#0F172A",
  accentForeground: "#F9FAFB",

  border: "#1F2933",
  input: "#1F2933",
  ring: "#38BDF8",

  destructive: "#EF4444",
  destructiveForeground: "#FEF2F2",

  success: "#22C55E",
  successForeground: "#BBF7D0",

  warning: "#EAB308",
  warningForeground: "#FEF9C3"
} as const;

export type OpsafeLightColors = typeof opsafeLightColors;
export type OpsafeDarkColors = typeof opsafeDarkColors;

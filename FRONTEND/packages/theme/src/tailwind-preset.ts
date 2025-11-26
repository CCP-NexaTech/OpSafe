import { opsafeLightColors } from "./tokens/colors";
import { opsafeRadius } from "./tokens/radius";

/**
 * Preset Tailwind do OpSafe.
 * - Usa light como default.
 * - Dark mode será controlado via `class` no app (tailwind.config do app).
 *
 * Não tipamos com `tailwindcss.Config` aqui para evitar
 * depender de tipos externos dentro do pacote.
 */
export const opsafeTailwindPreset = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // namespace opcional para usar bg-opsafe-background, etc.
        opsafe: {
          ...opsafeLightColors,
        },

        // aliases semânticos diretos (bg-background, text-foreground, etc.)
        background: opsafeLightColors.background,
        foreground: opsafeLightColors.foreground,

        card: opsafeLightColors.card,
        "card-foreground": opsafeLightColors.cardForeground,

        popover: opsafeLightColors.popover,
        "popover-foreground": opsafeLightColors.popoverForeground,

        primary: opsafeLightColors.primary,
        "primary-foreground": opsafeLightColors.primaryForeground,

        secondary: opsafeLightColors.secondary,
        "secondary-foreground": opsafeLightColors.secondaryForeground,

        muted: opsafeLightColors.muted,
        "muted-foreground": opsafeLightColors.mutedForeground,

        accent: opsafeLightColors.accent,
        "accent-foreground": opsafeLightColors.accentForeground,

        border: opsafeLightColors.border,
        input: opsafeLightColors.input,
        ring: opsafeLightColors.ring,

        destructive: opsafeLightColors.destructive,
        "destructive-foreground": opsafeLightColors.destructiveForeground,

        success: opsafeLightColors.success,
        "success-foreground": opsafeLightColors.successForeground,

        warning: opsafeLightColors.warning,
        "warning-foreground": opsafeLightColors.warningForeground,
      },
      borderRadius: {
        none: opsafeRadius.none,
        sm: opsafeRadius.sm,
        md: opsafeRadius.md,
        lg: opsafeRadius.lg,
        xl: opsafeRadius.xl,
        "2xl": opsafeRadius["2xl"],
        full: opsafeRadius.full,
      },
    },
  },
} as const;

export default opsafeTailwindPreset;

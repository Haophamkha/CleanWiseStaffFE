const tokens = require("../../tokens");

const c = tokens.colors;

export const COLORS = {
  primary: c.primary.DEFAULT as string,
  primaryFill: c.primary.fill as string,
  primaryFillDark: c.primary.fillDark as string,
  surfaceMuted: c.surfaceMuted as string,
  violet: c.violet.DEFAULT as string,
  violetLight: c.violet.light as string,
  primaryDark: c.primary.dark as string,
  primaryLight: c.primary.light as string,
  primarySoft: c.primary.soft as string,
  primaryBorder: c.primary.border as string,
  accent: c.accent.DEFAULT as string,
  accentFill: c.accent.fill as string,
  accentLight: c.accent.light as string,
  accentDark: c.accent.dark as string,
  canvas: c.canvas as string,
  surface: c.surface as string,
  line: c.line as string,
  ink: c.ink.DEFAULT as string,
  inkSoft: c.ink.soft as string,
  inkMuted: c.ink.muted as string,
  inkPanel: c.ink.panel as string,
  success: c.success.DEFAULT as string,
  successFill: c.success.fill as string,
  successLight: c.success.light as string,
  warning: c.warning.DEFAULT as string,
  warningFill: c.warning.fill as string,
  warningLight: c.warning.light as string,
  warningDark: c.warning.dark as string,
  danger: c.danger.DEFAULT as string,
  dangerFill: c.danger.fill as string,
  dangerLight: c.danger.light as string,
  info: c.info.DEFAULT as string,
  infoFill: c.info.fill as string,
  infoLight: c.info.light as string,
  infoDark: c.info.dark as string,
  white: "#FFFFFF",

  background: c.canvas as string,
  border: c.line as string,
  text: c.ink.DEFAULT as string,
  textSecondary: c.ink.soft as string,
  textMuted: c.ink.muted as string,
};

export const GRADIENTS = {
  hero: tokens.gradients.hero as [string, string, string],
};

export const SHADOWS = {
  card: {
    shadowColor: "#5A3E2B",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  float: {
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 5,
  },
} as const;

export const ON_DARK = {
  text: "#FFFFFF",
  textSoft: "rgba(255,255,255,0.72)",
  textMuted: "rgba(255,255,255,0.6)",
  surface: "rgba(255,255,255,0.12)",
  border: "rgba(255,255,255,0.25)",
  spinner: "rgba(255,255,255,0.7)",
} as const;

export const OVERLAY = "rgba(17,17,17,0.55)";

export const RADIUS = {
  hero: 32,
  sheet: 32,
  card: 20,
  pill: 999,
} as const;

export const TYPE = {
  button: { fontWeight: "800", letterSpacing: 0.8 },
  label: { fontWeight: "700", letterSpacing: 0.4 },
} as const;

export type ThemeColors = typeof COLORS;

function buildTheme(mode: "light" | "dark") {
  const palette = tokens.themes[mode];
  const color = palette.colors;
  const colors: ThemeColors = {
    ...COLORS,
    primary: color.primary.DEFAULT, primaryDark: color.primary.dark,
    primaryFill: color.primary.fill, primaryFillDark: color.primary.fillDark,
    primaryLight: color.primary.light, primarySoft: color.primary.soft, primaryBorder: color.primary.border,
    accentFill: color.accent.fill, successFill: color.success.fill, dangerFill: color.danger.fill, infoFill: color.info.fill,
    accent: color.accent.DEFAULT, accentLight: color.accent.light, accentDark: color.accent.dark,
    canvas: color.canvas, surface: color.surface, surfaceMuted: color.surfaceMuted, line: color.line,
    warning: color.warning.DEFAULT, warningFill: color.warning.fill, warningLight: color.warning.light, warningDark: color.warning.dark, inkPanel: color.ink.panel,
    ink: color.ink.DEFAULT, inkSoft: color.ink.soft, inkMuted: color.ink.muted,
    success: color.success.DEFAULT, successLight: color.success.light,
    danger: color.danger.DEFAULT, dangerLight: color.danger.light,
    info: color.info.DEFAULT, infoLight: color.info.light, infoDark: color.info.dark,
    violet: color.violet.DEFAULT, violetLight: color.violet.light,
    background: color.canvas, border: color.line, text: color.ink.DEFAULT,
    textSecondary: color.ink.soft, textMuted: color.ink.muted,
  };
  return {
    mode, isDark: mode === "dark", COLORS: colors,
    GRADIENTS: { hero: palette.gradients.hero as [string, string, string], wallet: [colors.primaryFill, colors.primaryFillDark] as [string, string] },
    CHAT_BG: mode === "dark" ? color.canvas : "#F5EDE4",
    SHADOWS: mode === "dark" ? {
      card: { ...SHADOWS.card, shadowColor: "#000000", shadowOpacity: 0.16, elevation: 0 },
      float: { ...SHADOWS.float, shadowColor: "#000000", shadowOpacity: 0.24, elevation: 3 },
    } : SHADOWS,
    OVERLAY: mode === "dark" ? "rgba(0,0,0,0.64)" : OVERLAY,
    TREND: { up: colors.success, upBg: colors.successLight, down: colors.danger, downBg: colors.dangerLight },
    variables: tokens.variables[mode] as Record<string, string>,
  };
}

export const APP_THEMES = { light: buildTheme("light"), dark: buildTheme("dark") };

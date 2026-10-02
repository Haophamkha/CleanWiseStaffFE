const tokens = require("../../tokens");

const c = tokens.colors;

export const COLORS = {
  primary: c.primary.DEFAULT as string,
  primaryDark: c.primary.dark as string,
  primaryLight: c.primary.light as string,
  primarySoft: c.primary.soft as string,
  primaryBorder: c.primary.border as string,
  accent: c.accent.DEFAULT as string,
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
  successLight: c.success.light as string,
  warning: c.warning.DEFAULT as string,
  warningLight: c.warning.light as string,
  warningDark: c.warning.dark as string,
  danger: c.danger.DEFAULT as string,
  dangerLight: c.danger.light as string,
  info: c.info.DEFAULT as string,
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

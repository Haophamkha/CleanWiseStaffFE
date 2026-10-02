const palettes = {
  kredo: {
    primary: {
      DEFAULT: "#C8282D",
      dark: "#A31E23",
      light: "#FBE9E9",
      soft: "#FDF4F3",
      border: "#F3C6C7",
    },
    gradient: ["#F3D9C4", "#FBE9E9", "#FBF7F2"],
  },
  wine: {
    primary: {
      DEFAULT: "#9F1D35",
      dark: "#7F1529",
      light: "#F9E3E8",
      soft: "#FCF1F3",
      border: "#EFBFCA",
    },
    gradient: ["#EBCFC0", "#F9E3E8", "#FBF7F2"],
  },
};

const ACTIVE = "kredo";

const p = palettes[ACTIVE];

module.exports = {
  colors: {
    primary: p.primary,
    // accent = tone da (dùng cho nền chip, nút phụ, icon phụ)
    accent: { DEFAULT: "#C4A183", light: "#F5EDE4", dark: "#8A5F3F" },
    canvas: "#FBF7F2",
    surface: "#FFFFFF",
    line: "#EADBCB",
    ink: {
      DEFAULT: "#111111",
      soft: "#57504B",
      muted: "#9A8F88",
      panel: "#2B2521",
    },
    success: { DEFAULT: "#2F8F5B", light: "#E4F4EA" },
    warning: { DEFAULT: "#D97706", light: "#FEF3C7", dark: "#92400E" },
    danger: { DEFAULT: "#9F1D22", light: "#FBE9E9" },
    info: { DEFAULT: "#3B6FB6", light: "#E6EEF9", dark: "#264E86" },
  },
  gradients: { hero: p.gradient },
};

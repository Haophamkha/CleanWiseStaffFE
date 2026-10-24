// Bảng màu sáng và tối của ứng dụng nhân viên.
const light = {
  "colors": {
    "primary": {
      "DEFAULT": "#C8282D",
      "dark": "#A31E23",
      "light": "#FBE9E9",
      "soft": "#FDF4F3",
      "border": "#F3C6C7",
      "fill": "#C8282D",
      "fillDark": "#A31E23"
    },
    "accent": {
      "DEFAULT": "#C4A183",
      "light": "#F5EDE4",
      "dark": "#8A5F3F",
      "fill": "#C4A183"
    },
    "canvas": "#FBF7F2",
    "surface": "#FFFFFF",
    "line": "#EADBCB",
    "ink": {
      "DEFAULT": "#111111",
      "soft": "#57504B",
      "muted": "#9A8F88",
      "panel": "#2B2521"
    },
    "success": {
      "DEFAULT": "#2F8F5B",
      "light": "#E4F4EA",
      "fill": "#2F8F5B"
    },
    "warning": {
      "DEFAULT": "#D97706",
      "light": "#FEF3C7",
      "dark": "#92400E",
      "fill": "#D97706"
    },
    "danger": {
      "DEFAULT": "#9F1D22",
      "light": "#FBE9E9",
      "fill": "#9F1D22"
    },
    "info": {
      "DEFAULT": "#3B6FB6",
      "light": "#E6EEF9",
      "dark": "#264E86",
      "fill": "#3B6FB6"
    },
    "surfaceMuted": "#F5EDE4",
    "violet": {
      "DEFAULT": "#7C3AED",
      "light": "#EDE9FE"
    }
  },
  "gradients": {
    "hero": [
      "#F3D9C4",
      "#FBE9E9",
      "#FBF7F2"
    ]
  }
};
const dark = {
  "colors": {
    "primary": {
      "DEFAULT": "#FDA4AF",
      "dark": "#FECDD3",
      "fill": "#B42332",
      "fillDark": "#901C2C",
      "light": "#392A31",
      "soft": "#2B2229",
      "border": "#57404B"
    },
    "accent": {
      "DEFAULT": "#E1BA98",
      "fill": "#805738",
      "light": "#362F29",
      "dark": "#F0D2B6"
    },
    "canvas": "#111318",
    "surface": "#1B1F27",
    "surfaceMuted": "#252B35",
    "line": "#2C333D",
    "ink": {
      "DEFAULT": "#F1F5F9",
      "soft": "#B8C0CC",
      "muted": "#929EAF",
      "panel": "#252B35"
    },
    "success": {
      "DEFAULT": "#86EFAC",
      "fill": "#166534",
      "light": "#23362E"
    },
    "warning": {
      "DEFAULT": "#FCD34D",
      "fill": "#92400E",
      "light": "#362F23",
      "dark": "#FDE68A"
    },
    "danger": {
      "DEFAULT": "#FCA5A5",
      "fill": "#B91C1C",
      "light": "#38282D"
    },
    "info": {
      "DEFAULT": "#93C5FD",
      "fill": "#1D4ED8",
      "light": "#243145",
      "dark": "#BFDBFE"
    },
    "violet": {
      "DEFAULT": "#C4B5FD",
      "light": "#302D40"
    }
  },
  "gradients": {
    "hero": [
      "#2D222A",
      "#1E1F27",
      "#111318"
    ]
  }
};
function colorVariables(colors, prefix = "--cw") {
  const result = {};
  for (const [key, value] of Object.entries(colors)) {
    const name = key === "DEFAULT" ? prefix : `${prefix}-${key.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`)}`;
    if (typeof value === "object") Object.assign(result, colorVariables(value, name));
    else {
      const hex = value.replace("#", "");
      result[name] = [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16)).join(" ");
    }
  }
  return result;
}
function variableColors(colors, prefix = "--cw") {
  return Object.fromEntries(Object.entries(colors).map(([key, value]) => {
    const name = key === "DEFAULT" ? prefix : `${prefix}-${key.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`)}`;
    return [key === "DEFAULT" ? "DEFAULT" : key.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`), typeof value === "object" ? variableColors(value, name) : `rgb(var(${name}) / <alpha-value>)`];
  }));
}
module.exports = {
  ...light,
  themes: { light, dark },
  variables: { light: colorVariables(light.colors), dark: colorVariables(dark.colors) },
  tailwindColors: variableColors(light.colors),
};

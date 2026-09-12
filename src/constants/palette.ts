const main = {
  500: "#F4836D",
  400: "#FF9A86",
  300: "#FFB399",
  200: "#FFD6A6",
  100: "#FFF0BE",
} as const;

const sub = {
  500: "#A4C793",
  400: "#B0DB9C",
  300: "#CAE8BD",
  200: "#DDF6D2",
  100: "#ECFAE5",
} as const;

const gray = {
  700: "#37353E",
  600: "#46434E",
  500: "#66636C",
  400: "#807E87",
  300: "#ABA9B3",
  200: "#E3E1E7",
  100: "#F2F1F4",
} as const;

const error = {
  300: "#FF6E64",
  200: "#FFA8A2",
  100: "#FFE3E1",
} as const;

const success = {
  300: "#2BD236",
  200: "#81F689",
  100: "#DDFFE0",
} as const;

export const Palette = {
  main,
  sub,
  gray,

  black: "#222222",
  white: "#FFFFFF",

  error,
  success,

  background: {
    base: "#FEFEFE",
    subtle: "#FAFAFA",
  },

  border: {
    strong: "#ABA9B3",
    default: "#CFCED2",
    disabled: "#E6E5E8",
  },

  status: {
    allowed: success,
    denied: error,
    unknown: { 300: gray[500], 200: gray[300], 100: gray[100] },
  },
} as const;

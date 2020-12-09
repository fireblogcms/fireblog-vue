module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          default: "#6366F1",
          darker: "#4F46E5",
          dark: "#6147d4",
        },
        secondary: {
          default: "#d9c2ff",
          darker: "#c0a9ff",
          dark: "#a68fff",
        },
        danger: {
          light: "#fddfdd",
          default: "#f44336",
          darker: "#db2a1d",
          dark: "#c11003",
        },
        blackOpacity50: {
          default: "rgba(0, 0, 0, .5)",
        },
        alabaster: {
          default: "rgba(250, 250, 250, 0.8)",
        },
      },
      boxShadow: {
        around: "0px 2px 16px 0 rgba(0, 0, 0, 0.2)",
      },
      height: {
        "320": "320px",
      },
      minHeight: {
        "10": "10rem",
      },
      minWidth: {
        "15": "15rem",
      },
      maxHeight: {
        "9/10": "90vh",
      },
      maxWidth: {
        "850": "850px",
        "900": "900px",
        "1000": "1000px",
      },
      opacity: {
        "90": ".9",
      },
    },
  },
  variants: {
    backgroundColor: ["responsive", "hover", "focus", "active"],
    borderColor: ["responsive", "hover", "focus", "active"],
    borderWidth: ["responsive", "last", "hover", "focus", "active"],
    textColor: ["responsive", "hover", "focus", "active"],
  },
  plugins: [],
};

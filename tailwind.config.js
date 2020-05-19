module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#ff5fa7",
          lighter: "#e6468e",
          default: "#cc2c74",
          darker: "#b3135b",
          dark: "#990041"
        },
        secondary: {
          default: "#ffdd57"
        },
        blackOpacity50: {
          default: "rgba(0, 0, 0, .5)"
        }
      },
      boxShadow: {
        around: "0px 2px 16px 0 rgba(0, 0, 0, 0.2)",
        bottom: "0 6px 4px -4px rgba(0, 0, 0, .08)"
      },
      minWidth: {
        "15": "15rem"
      },
      maxHeight: {
        "9/10": "90vh"
      }
    }
  },
  variants: {
    backgroundColor: ["responsive", "hover", "focus", "active"],
    borderColor: ["responsive", "hover", "focus", "active"],
    borderWidth: ["responsive", "last", "hover", "focus", "active"],
    textColor: ["responsive", "hover", "focus", "active"]
  },
  plugins: []
};

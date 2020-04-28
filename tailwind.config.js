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
        }
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
    textColor: ["responsive", "hover", "focus", "active"]
  },
  plugins: []
};

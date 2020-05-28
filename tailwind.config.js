module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          default: "#735cd9",
          light: "#a68fff",
          lighter: "#8d76f3",
          darker: "#6a52d7",
          dark: "#6147d4"
        },
        secondary: {
          default: "#ffdd57"
        },
        blackOpacity50: {
          default: "rgba(0, 0, 0, .5)"
        }
      },
      boxShadow: {
        around: "0px 2px 16px 0 rgba(0, 0, 0, 0.2)"
      },
      minHeight: {
        "10": "10rem"
      },
      minWidth: {
        "15": "15rem"
      },
      maxHeight: {
        "9/10": "90vh"
      },
      maxWidth: {
        "830": "830px"
      },
      opacity: {
        "90": ".9"
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

module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          default: "#735cd9",
          darker: "#6a52d7",
          dark: "#6147d4"
        },
        secondary: {
          default: "#d9c2ff",
          darker: "#c0a9ff",
          dark: "#a68fff"
        },
        label: {
          default: "#ffdd57"
        },
        danger: {
          light: "#fddfdd",
          default: "#f44336",
          darker: "#db2a1d",
          dark: "#c11003"
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
        "850": "850px"
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

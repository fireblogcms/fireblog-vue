module.exports = {
  plugins: [
    require("tailwindcss")(),
    require("@fullhuman/postcss-purgecss")({
      content: ["./public/**/*.html", "./src/**/*.vue"],
      defaultExtractor: content => {
        const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
        const innerMatches =
          content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
        return broadMatches.concat(innerMatches);
      },
      whitelist: [],
      whitelistPatterns: [
        /-(leave|enter|appear)(|-(to|from|active))$/,
        /^(?!(|.*?:)cursor-move).+-move$/,
        /^router-link(|-exact)-active$/,
        /^app-toast-/
      ]
    }),
    require("autoprefixer")()
  ]
};

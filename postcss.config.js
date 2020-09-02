module.exports = {
  plugins: [
    require("tailwindcss")(),
    ...(process.env.NODE_ENV !== "development"
      ? [
          require("@fullhuman/postcss-purgecss")({
            content: ["./public/**/*.html", "./src/**/*.vue"],
            defaultExtractor: content => {
              const broadMatches =
                content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
              const innerMatches =
                content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
              return broadMatches.concat(innerMatches);
            },
            whitelist: [],
            whitelistPatterns: [
              /^language-/, // for prismJS component
              /-(leave|enter|appear)(|-(to|from|active))$/,
              /^(?!(|.*?:)cursor-move).+-move$/,
              /^router-link(|-exact)-active$/,
              /^app-toast-/,
            ],
          }),
        ]
      : []),
    require("autoprefixer")(),
  ],
};

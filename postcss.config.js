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
            whitelistPatterns: [
              /-(leave|enter|appear)(|-(to|from|active))$/,
              /^(?!(|.*?:)cursor-move).+-move$/,
              /^router-link(|-exact)-active$/,
              /^app-toast-/,
              /^vue-tags-input/,
            ],
            whitelistPatternsChildren: [
              // for prismJS component
              /^language-/,
              /^token/,
              /^pre/,
              /^code/,
              /^tag-auto-complete/,
            ],
          }),
        ]
      : []),
    require("autoprefixer")(),
  ],
};

module.exports = {
  plugins: [
    require("tailwindcss")(),
    ...(process.env.NODE_ENV !== "development"
      ? [
          require("@fullhuman/postcss-purgecss")({
            content: ["./public/**/*.html", "./src/**/*.vue"],
            whitelistPatterns: [
              /-(leave|enter|appear)(|-(to|from|active))$/,
              /^(?!(|.*?:)cursor-move).+-move$/,
              /^router-link(|-exact)-active$/,
              /^app-toast-/,
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

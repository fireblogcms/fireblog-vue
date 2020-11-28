module.exports = {
  plugins: [
    require("tailwindcss")(),
    ...(process.env.NODE_ENV !== "development"
      ? [
          require("@fullhuman/postcss-purgecss")({
            // https://medium.com/@kyis/vue-tailwind-purgecss-the-right-way-c70d04461475#3f95
            content: ["./public/**/*.html", "./src/**/*.vue"],
            defaultExtractor: content => {
              const contentWithoutStyleBlocks = content.replace(
                /<style[^]+?<\/style>/gi,
                ""
              );
              return (
                contentWithoutStyleBlocks.match(
                  /[A-Za-z0-9-_/:]*[A-Za-z0-9-_/]+/g
                ) || []
              );
            },
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

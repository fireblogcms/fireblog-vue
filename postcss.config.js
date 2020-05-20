module.exports = {
  plugins: [
    require("tailwindcss")(),
    require("@fullhuman/postcss-purgecss")({
      content: ["./public/**/*.html", "./src/**/*.vue"],
      defaultExtractor: content => {
        return content.match(/[A-Za-z0-9-_/:]*[A-Za-z0-9-_/]+/g) || [];
      },
      whitelist: [],
      whitelistPatterns: [
        /-(leave|enter|appear)(|-(to|from|active))$/,
        /^(?!(|.*?:)cursor-move).+-move$/,
        /^router-link(|-exact)-active$/
      ]
    }),
    require("autoprefixer")()
  ]
};

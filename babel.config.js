module.exports = {
  presets: ["@vue/app"],
  plugins: [
    [
      "prismjs",
      {
        languages: ["graphql"],
        theme: "default",
      },
    ],
  ],
};

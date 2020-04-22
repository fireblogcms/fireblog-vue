const path = require("path");

module.exports = ({ config, mode }) => {
  config.module.rules.push({
    test: /\.css$/,
    loaders: [
      {
        loader: "postcss-loader",
        options: {
          sourceMap: true,
          config: {
            path: "./.storybook/"
          }
        }
      }
    ],
    include: path.resolve(__dirname, "../storybook/")
  });
  config.resolve.alias = {
    ...config.resolve.alias,
    "@": path.resolve(__dirname, "../src"),
    "~": path.resolve(__dirname, "../src")
  };
  return config;
};

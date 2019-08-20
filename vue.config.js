const PurgecssPlugin = require("purgecss-webpack-plugin");
const glob = require("glob-all");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

function checkRequiredEnvVars(exampleEnvFilePath) {
  const envExampleFileContent = fs.readFileSync(exampleEnvFilePath);
  const requiredVars = dotenv.parse(envExampleFileContent);
  Object.keys(requiredVars).map(key => {
    if (!process.env[key]) {
      throw new Error(
        `Environnement variable ${key} not found, please add it.`
      );
    }
  });
}

checkRequiredEnvVars(".env.example");

module.exports = {
  configureWebpack: {
    // Merged into the final Webpack config
    plugins: [
      new PurgecssPlugin({
        paths: glob.sync([
          path.join(__dirname, "./src/index.html"),
          path.join(__dirname, "./**/*.vue"),
          path.join(__dirname, "./src/**/*.js")
        ])
      })
    ]
  }
};

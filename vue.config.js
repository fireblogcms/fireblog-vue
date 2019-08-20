const PurgecssPlugin = require("purgecss-webpack-plugin");
const glob = require("glob-all");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const difference = require("lodash.difference");

/**
 * Make sure all vars defined in env.example are defined in .env, and vice versa.
 * @param {string} path of .env
 * @param {string} path of .env examples
 */
function checkRequiredEnvVars(envFile, exampleEnvFile) {
  const envExampleFileContent = fs.readFileSync(exampleEnvFile);
  const envExampleVars = dotenv.parse(envExampleFileContent);
  const envFileContent = fs.readFileSync(envFile);
  const envVars = dotenv.parse(envFileContent);
  const diffLeft = difference(
    Object.keys(envVars),
    Object.keys(envExampleVars)
  );
  const diffRight = difference(
    Object.keys(envExampleVars),
    Object.keys(envVars)
  );
  let diffDetected = null;
  if (diffLeft.length > 0) {
    diffDetected = true;
    console.log(
      `Error: Thoses keys are defined in ${envFile} but not in ${exampleEnvFile} : ${diffLeft}`
    );
  }
  if (diffRight.length > 0) {
    diffDetected = true;
    console.log(
      `Error: Thoses keys are defined in ${exampleEnvFile} but not in ${envFile} : ${diffRight}`
    );
  }
  if (diffDetected) {
    throw new Error(
      `Environment variables error: differences detected between ${envFile} and ${exampleEnvFile}`
    );
  }
}

checkRequiredEnvVars(".env.local", ".env.example");

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

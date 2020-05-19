const fs = require("fs");
const dotenv = require("dotenv");
const difference = require("lodash.difference");

/**
 * Make sure all env vars are correctly defined.
 *
 * @param {string} path of .env
 * @param {string} path of .env examples
 */
function checkEnvVars(exampleEnvFile) {
  // .env.example is versionned and present in all environments
  const envExampleFileContent = fs.readFileSync(exampleEnvFile);
  const envExampleVars = dotenv.parse(envExampleFileContent);

  /**
   * In development mode, a `.env` is used to load variables
   * Make sure ".env" and ".env.example" contain the same variables.
   */
  if (process.env.NODE_ENV === "development") {
    if (!fs.existsSync(".env")) {
      console.error(".env file is missing. Please create it.");
      process.exit(1);
    }
    const envFileContent = fs.readFileSync(".env");
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
        `Error: Thoses keys are defined in .env but not in ${exampleEnvFile} : ${diffLeft}`
      );
    }
    if (diffRight.length > 0) {
      diffDetected = true;
      console.log(
        `Error: Thoses keys are defined in ${exampleEnvFile} but not in .env: ${diffRight}`
      );
    }
    if (diffDetected) {
      throw new Error(
        `Environment variables error: differences detected between .env and ${exampleEnvFile}`
      );
    }
  }

  /**
   * On Heroku, Netlify and such, env vars are defined in UI, not in a `.env` file.
   * Make sure that all variables in ".env.example" are defined.
   */
  if (process.env.NODE_ENV === "production") {
    const missing = [];
    Object.keys(envExampleVars).map(key => {
      if (!process.env[key]) {
        missing.push(key);
      }
    });
    if (missing.length > 0) {
      throw new Error(
        `Those Env variable are not defined :  ${missing.join(",")}`
      );
    }
  }
}

checkEnvVars(".env.example");

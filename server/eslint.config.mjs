import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import js from "@eslint/js";
import google from "eslint-config-google";

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  google,
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {files: ["**/*.js"], languageOptions: {sourceType: "module"}},
  {ignores: [
    "**/node_modules/**",
    "**/build/**",
  ]},
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "indent": ["error", 2], // Enforce 2 spaces (Google style)
      "quotes": ["error", "double"], // Enforce double quotes
      "max-len": ["error", {"code": 200}], // Limit line length to 200 characters
      "require-jsdoc": "off", // Disable JSDoc requirement
      "new-cap": 0,
    },
  },
  {languageOptions: {globals: globals.browser}},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];

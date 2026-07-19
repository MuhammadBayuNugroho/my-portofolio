import js from "@eslint/js";
import typescriptParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
    },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-unused-vars": "off", // Dikelola oleh TypeScript
      "no-undef": "off", // Dikelola oleh TypeScript
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
    },
  },
];

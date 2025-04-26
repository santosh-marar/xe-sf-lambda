import eslint from "@eslint/js"
import tseslint from "typescript-eslint"

export default tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommended, {
    ignores: ["build/**/*"],
  },
  {
    files: ["src/**/*.{ts,js}"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
  rules: {
    "no-console": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-explicit-any": "off",
  },
})

import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // Ignorar pastas geradas automaticamente
  { ignores: [".next/**", "node_modules/**", ".git/**", "**/*.min.js"] },

  // Configuração base para todos os arquivos
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // TypeScript ESLint
  ...tseslint.configs.recommended,

  // React plugin
  {
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: "18.2",
      },
    },
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
      // Next.js não requer importar React em componentes
      "react/react-in-jsx-scope": "off",
    },
  },

  // Configuração específica para arquivos Node.js (deve vir DEPOIS do tseslint)
  {
    files: [
      "infra/**/*.js",
      "jest.config.js",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
    ],
    languageOptions: {
      globals: globals.node,
      sourceType: "commonjs",
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },

  // Configuração específica para arquivos de teste
  {
    files: ["tests/**/*.js", "**/*.test.js", "**/*.spec.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
]);

import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "ignoreRestSiblings": true
      }],
    },
  },
  // Shadcn UI primitives intentionally co-locate variants/constants with
  // components (canonical shadcn pattern). Disable react-refresh noise here.
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  // Context providers intentionally co-locate the Provider component with
  // its consumer hook (e.g. useLanguage, useVIP, useSelenaChat). Splitting
  // would force two-file imports across the entire app for zero runtime gain.
  {
    files: ["src/contexts/**/*.{ts,tsx}", "src/lib/utils/parseInlineMarkdown.tsx"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  // Tiny utility components that re-export helpers (badges, tool bridges)
  {
    files: [
      "src/components/v2/guides/GuideCardBadge.tsx",
      "src/components/v2/guides/GuideToolBridge.tsx",
      "src/components/v2/seller-decision/StepDualPath.tsx",
    ],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
);

import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig } from "eslint/config";

/**
 * ESLint 10 flat config.
 * Catatan: `eslint-plugin-react` (7.x) masih peer `eslint@^9.7`, jadi tidak dipakai di sini —
 * aturan React yang benar-benar perlu (hooks + refresh) sudah Rider oleh dua plugin di bawah.
 */
export default defineConfig([
  {
    ignores: ["dist", "node_modules", "out"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      // Effect yang memanggil setState itu sah kalau sumber datanya di luar React
      // (window.location.hash, CloudBase storage). Kita izinkan agar tidak perlu
      // disable seluruh file, tapi tetap ingat: jangan pakai untuk state turunan.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["*.config.{js,ts}", ".github/workflows/*.yml"],
    languageOptions: { globals: globals.node },
  },
]);
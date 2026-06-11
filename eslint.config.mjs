import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const nextVitalsWithoutReactRules = nextVitals.map((config) => {
  if (!config.rules) return config;
  return {
    ...config,
    rules: Object.fromEntries(
      Object.entries(config.rules).filter(([rule]) => !rule.startsWith("react/") || rule === "react/jsx-key")
    ),
  };
});

const eslintConfig = defineConfig([
  ...nextVitalsWithoutReactRules,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "*.config.*",
    "*.setup.*",
    ".claude/**",
    ".claude-flow/**",
    ".orchestra/**",
    ".superpowers/**",
    ".swarm/**",
    "public/**",
  ]),
  {
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;

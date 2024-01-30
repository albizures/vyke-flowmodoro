import type { KnipConfig } from "knip";

const config: KnipConfig = {
  ignoreExportsUsedInFile: true,
  astro: {
    entry: [
      "astro.config.{js,cjs,mjs,ts}",
      "src/content/config.ts",
      "src/pages/**/*.{astro,mdx,js,ts}",
      "src/content/**/*.mdx",
    ],
  },
};

export default config;

import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import { SITE } from "./src/config";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  devToolbar: {
    enabled: false,
  },
  integrations: [tailwind(), icon(), sitemap()],
  vite: {
    plugins: [basicSsl()],
    server: {
      // @ts-expect-error
      https: true,
    },
  },
});

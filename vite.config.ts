import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { crx } from "@crxjs/vite-plugin";
import { resolve } from "path";
import manifest from "./src/manifest.json";

export default defineConfig({
  plugins: [vue(), crx({ manifest })],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        chunkFileNames: (chunk) => {
          const moduleId = chunk.facadeModuleId || "";
          const folder = moduleId.includes("/popup/")
            ? "popup/chunks"
            : moduleId.includes("/background/")
            ? "background/chunks"
            : moduleId.includes("/content/")
            ? "content/chunks"
            : "shared/chunks";
          return `${folder}/[name]-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || "";

          if (/\.(css)$/.test(name)) {
            if (name.includes("popup")) {
              return "popup/styles/[name][extname]";
            }
            return "shared/styles/[name][extname]";
          }
          if (/\.(png|jpg|jpeg|gif|svg)$/.test(name)) {
            return "assets/images/[name][extname]";
          }
          return "assets/[ext]/[name][extname]";
        },
      },
    },
  },
  publicDir: "public",
});

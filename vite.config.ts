import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { crx } from "@crxjs/vite-plugin";
import { resolve } from "path";
import type { ManifestV3Export } from "@crxjs/vite-plugin";

// 导入 manifest
import manifest from "./src/manifest.json";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), crx({ manifest: manifest as ManifestV3Export })],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    watch: {
      // 忽略 Windows 系统文件，避免 EBUSY 错误
      ignored: [
        "**/node_modules/**",
        "**/dist/**",
        "C:/DumpStack.log.tmp",
        "**/DumpStack.log.tmp",
        "C:\\DumpStack.log.tmp",
        "**\\DumpStack.log.tmp",
      ],
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      watch: {
        exclude: [
          "**/node_modules/**",
          "**/dist/**",
          "C:/DumpStack.log.tmp",
          "**/DumpStack.log.tmp",
          "C:\\DumpStack.log.tmp",
          "**\\DumpStack.log.tmp",
        ],
      },
      output: {
        chunkFileNames: (chunk) => {
          const moduleId = chunk.facadeModuleId || "";
          const folder = moduleId.includes("/popup/")
            ? "popup/chunks"
            : moduleId.includes("/background/")
            ? "background/chunks"
            : moduleId.includes("/content/")
            ? "content/chunks"
            : moduleId.includes("/options/")
            ? "options/chunks"
            : "shared/chunks";
          return `${folder}/[name]-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || "";

          if (/\.(css)$/.test(name)) {
            if (name.includes("popup")) {
              return "popup/styles/[name][extname]";
            }
            if (name.includes("options")) {
              return "options/styles/[name][extname]";
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

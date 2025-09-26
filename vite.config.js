import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  base: "/KimchiStew/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});

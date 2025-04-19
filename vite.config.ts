import react from "@vitejs/plugin-react";
import tailwind from "tailwindcss";
import { defineConfig } from "vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  css: {
    postcss: {
      plugins: [tailwind()],
    },
  },
  define: {
    'process.env': process.env
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});

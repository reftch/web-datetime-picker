import { defineConfig } from "vite";

export default defineConfig({
  publicDir: 'src/assets',
  server: {
    host: '0.0.0.0',
    port: 3002,
  },
  preview: {
    port: 3002
  }
});

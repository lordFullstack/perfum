import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages sirve el sitio bajo /<repo>/ (salvo páginas de usuario/org
  // tipo <usuario>.github.io). El workflow de CI inyecta VITE_BASE_PATH;
  // en desarrollo local y en Vercel/Netlify (dominio propio) se usa "/".
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons/*.png"],
      manifest: {
        id: process.env.VITE_BASE_PATH || "/",
        name: "AromaPro",
        short_name: "AromaPro",
        description:
          "Administración integral de perfumería: inventario de insumos, recetas, producción, ventas y catálogo online.",
        theme_color: "#15130F",
        background_color: "#15130F",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: process.env.VITE_BASE_PATH || "/",
        scope: process.env.VITE_BASE_PATH || "/",
        lang: "es",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        // Runtime caching: la app funciona offline con el último estado conocido.
        // Las escrituras (ventas, producción, etc.) se encolan en IndexedDB
        // (ver src/infrastructure/offline/syncQueue.ts) y se sincronizan al
        // recuperar conexión — no se cachean respuestas mutables de Supabase aquí.
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin.includes("supabase.co") &&
              url.pathname.includes("/rest/v1/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "aromapro-api-cache",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "aromapro-image-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

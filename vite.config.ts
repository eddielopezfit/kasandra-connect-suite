import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      isDev && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    esbuild: {
      drop: isDev ? [] : ["console", "debugger"],
    },
    build: {
      chunkSizeWarningLimit: 800,
      cssCodeSplit: true,
      sourcemap: false,
      minify: "esbuild",
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
              return "react-vendor";
            }
            if (id.includes("node_modules/@supabase/")) {
              return "supabase-vendor";
            }
            if (id.includes("node_modules/framer-motion/") || id.includes("node_modules/recharts/")) {
              return "ui-heavy-vendor";
            }
            if (id.includes("node_modules/@radix-ui/")) {
              return "radix-vendor";
            }
          },
        },
      },
    },
  };
});

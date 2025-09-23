import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/frontdash/", // change if your repo name differs
  plugins: [react()],
});
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/frontdash/", // replace 'frontdash' if your repo has a different name
  plugins: [react()],
});
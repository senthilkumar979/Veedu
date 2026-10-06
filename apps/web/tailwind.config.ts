import type { Config } from "tailwindcss";
import preset from "../../packages/config/tailwind.preset";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  presets: [preset],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;

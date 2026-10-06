import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@veedu/ui",
    "@veedu/domain",
    "@veedu/types",
    "@veedu/api",
  ],
  outputFileTracingRoot: path.join(__dirname, "../.."),
  experimental: {
    optimizePackageImports: ["lucide-react", "@veedu/ui"],
  },
};

export default nextConfig;

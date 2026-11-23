import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Serve the Wilson Yap CRM (static app in /public/crm) at a clean /crm URL
      { source: "/crm", destination: "/crm/index.html" },
    ];
  },
};

export default nextConfig;

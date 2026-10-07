import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/projects", destination: "/services", permanent: false },
      { source: "/projects/:code", destination: "/services/:code", permanent: false },
      { source: "/team", destination: "/users", permanent: false },
      { source: "/audit", destination: "/roles", permanent: false },
      { source: "/profile", destination: "/settings", permanent: false },
    ]
  },
}

export default nextConfig

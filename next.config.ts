import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 사용자가 "/" 로 들어오면 기본 언어 페이지로 보낸다.
  async redirects() {
    return [{ source: "/", destination: "/ko", permanent: false }];
  },
};

export default nextConfig;

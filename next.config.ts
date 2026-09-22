import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Cloudflare 정적 배포용 설정.
   * 빌드하면 out/ 폴더에 HTML 파일들이 만들어진다. 서버가 필요 없다.
   */
  output: "export",
  distDir: ".next",
  // 정적 배포에서는 이미지 최적화 서버가 없다.
  images: { unoptimized: true },
  // 주소 끝에 / 를 붙이지 않는다 (예: /ko/height). Cloudflare 가 알아서 찾아준다.
  trailingSlash: false,
};

export default nextConfig;

import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

function buildRemotePatterns(): RemotePattern[] {
  const publicBaseUrl = process.env.AWS_S3_PUBLIC_BASE_URL;

  if (publicBaseUrl) {
    const url = new URL(publicBaseUrl);

    return [
      {
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        pathname: `${url.pathname.replace(/\/$/, "")}/**`,
      },
    ];
  }

  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION;

  if (!bucket || !region) {
    return [];
  }

  return [
    {
      protocol: "https",
      hostname:
        region === "us-east-1"
          ? `${bucket}.s3.amazonaws.com`
          : `${bucket}.s3.${region}.amazonaws.com`,
      pathname: "/**",
    },
  ];
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: buildRemotePatterns(),
  },
};

export default nextConfig;

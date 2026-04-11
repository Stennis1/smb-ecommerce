import { randomUUID } from "node:crypto";
import { S3Client } from "@aws-sdk/client-s3";

const globalForS3 = globalThis as {
  s3Client?: S3Client;
};

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

export function getS3BucketName() {
  return getRequiredEnv("AWS_S3_BUCKET");
}

export function getS3Region() {
  return getRequiredEnv("AWS_REGION");
}

export function getS3Client() {
  if (globalForS3.s3Client) {
    return globalForS3.s3Client;
  }

  const client = new S3Client({
    region: getS3Region(),
    credentials: {
      accessKeyId: getRequiredEnv("AWS_ACCESS_KEY_ID"),
      secretAccessKey: getRequiredEnv("AWS_SECRET_ACCESS_KEY"),
    },
  });

  if (process.env.NODE_ENV !== "production") {
    globalForS3.s3Client = client;
  }

  return client;
}

export function buildListingImageKey(filename: string) {
  const extension = filename.includes(".")
    ? filename.split(".").pop()?.toLowerCase()
    : undefined;

  const safeExtension = extension?.replace(/[^a-z0-9]/g, "") || "bin";

  return `listings/uploads/${randomUUID()}.${safeExtension}`;
}

export function getS3PublicBaseUrl() {
  const explicitBaseUrl = process.env.AWS_S3_PUBLIC_BASE_URL;

  if (explicitBaseUrl) {
    return explicitBaseUrl.replace(/\/$/, "");
  }

  const bucket = getS3BucketName();
  const region = getS3Region();

  if (region === "us-east-1") {
    return `https://${bucket}.s3.amazonaws.com`;
  }

  return `https://${bucket}.s3.${region}.amazonaws.com`;
}

export function getS3ObjectUrl(key: string | null | undefined) {
  if (!key) {
    return null;
  }

  return `${getS3PublicBaseUrl()}/${key}`;
}

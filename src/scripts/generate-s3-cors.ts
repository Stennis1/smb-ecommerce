import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

function getOrigins() {
  const configuredOrigins = process.env.AWS_S3_ALLOWED_ORIGINS
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (configuredOrigins && configuredOrigins.length > 0) {
    return Array.from(new Set(configuredOrigins));
  }

  const fallbackOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL,
    "http://localhost:3000",
  ].filter((value): value is string => Boolean(value));

  return Array.from(new Set(fallbackOrigins));
}

const corsConfiguration = [
  {
    AllowedHeaders: ["*"],
    AllowedMethods: ["PUT", "GET", "HEAD"],
    AllowedOrigins: getOrigins(),
    ExposeHeaders: ["ETag"],
  },
];

console.log(JSON.stringify(corsConfiguration, null, 2));

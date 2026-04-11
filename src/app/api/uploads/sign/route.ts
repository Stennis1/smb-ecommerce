import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import {
  buildListingImageKey,
  getS3BucketName,
  getS3Client,
} from "@/lib/s3";

const uploadRequestSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
});

const allowedContentTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const json = await request.json();
  const parsedBody = uploadRequestSchema.safeParse(json);

  if (!parsedBody.success) {
    return NextResponse.json(
      { message: "Invalid upload request." },
      { status: 400 },
    );
  }

  const { filename, contentType } = parsedBody.data;

  if (!allowedContentTypes.has(contentType)) {
    return NextResponse.json(
      { message: "Unsupported file type." },
      { status: 400 },
    );
  }

  const key = buildListingImageKey(filename);
  const command = new PutObjectCommand({
    Bucket: getS3BucketName(),
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(getS3Client(), command, {
    expiresIn: 60,
  });

  return NextResponse.json({
    key,
    uploadUrl,
  });
}

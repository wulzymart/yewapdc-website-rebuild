import { S3Client, PutObjectCommand, DeleteObjectCommand, CopyObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

import type { StorageAdapter, StorageFile, UploadParams } from "@/lib/storage/storage-adapter";
import { env } from "@/lib/utils/env";

function getS3Client(): S3Client {
  if (!env.S3_BUCKET || !env.S3_REGION) {
    throw new Error("S3_BUCKET and S3_REGION must be set when using S3 storage");
  }

  return new S3Client({
    region: env.S3_REGION,
    credentials:
      env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY
        ? {
            accessKeyId: env.S3_ACCESS_KEY_ID,
            secretAccessKey: env.S3_SECRET_ACCESS_KEY,
          }
        : undefined,
  });
}

function getBucket(): string {
  if (!env.S3_BUCKET) {
    throw new Error("S3_BUCKET must be set when using S3 storage");
  }
  return env.S3_BUCKET;
}

export const s3StorageAdapter: StorageAdapter = {
  async upload({ key, body, contentType }: UploadParams): Promise<StorageFile> {
    const client = getS3Client();
    const bucket = getBucket();

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );

    const url = `https://${bucket}.s3.${env.S3_REGION}.amazonaws.com/${key}`;

    return {
      key,
      url,
      size: body.byteLength,
      contentType,
    };
  },

  async delete(key: string): Promise<void> {
    const client = getS3Client();
    const bucket = getBucket();

    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  },

  async getUrl(key: string): Promise<string> {
    const bucket = getBucket();
    return `https://${bucket}.s3.${env.S3_REGION}.amazonaws.com/${key}`;
  },

  async move(from: string, to: string): Promise<void> {
    const client = getS3Client();
    const bucket = getBucket();

    await client.send(
      new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${from}`,
        Key: to,
      }),
    );

    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: from,
      }),
    );
  },

  async list(prefix?: string): Promise<StorageFile[]> {
    const client = getS3Client();
    const bucket = getBucket();

    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
      }),
    );

    const contents = response.Contents ?? [];

    return contents
      .filter((object) => object.Key)
      .map((object) => ({
        key: object.Key as string,
        url: `https://${bucket}.s3.${env.S3_REGION}.amazonaws.com/${object.Key}`,
        size: Number(object.Size ?? 0),
        contentType: "application/octet-stream",
        lastModified: object.LastModified,
      }));
  },
};

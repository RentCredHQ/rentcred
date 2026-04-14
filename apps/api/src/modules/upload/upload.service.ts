import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private s3: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = process.env.R2_BUCKET || process.env.S3_BUCKET || 'rentcred-uploads';

    const endpoint = process.env.R2_ENDPOINT || process.env.S3_ENDPOINT;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.S3_SECRET_KEY;

    const config: any = {
      region: 'auto',
    };

    if (endpoint) {
      config.endpoint = endpoint;
      config.forcePathStyle = false; // R2 uses virtual-hosted style
    }

    if (accessKeyId && secretAccessKey) {
      config.credentials = { accessKeyId, secretAccessKey };
    }

    this.s3 = new S3Client(config);
  }

  /**
   * Generate a presigned URL for direct client-side upload.
   * Returns the upload URL and the final object key.
   */
  async getPresignedUploadUrl(
    folder: string,
    filename: string,
    contentType: string,
  ): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      throw new BadRequestException(
        `File type not allowed. Accepted: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    const ext = filename.split('.').pop() || 'bin';
    const key = `${folder}/${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 600 }); // 10 min

    const publicUrl = this.buildPublicUrl(key);

    return { uploadUrl, key, publicUrl };
  }

  /**
   * Upload a file buffer directly from the server.
   */
  async upload(
    folder: string,
    filename: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<{ key: string; url: string }> {
    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      throw new BadRequestException('File type not allowed');
    }

    if (buffer.length > MAX_FILE_SIZE) {
      throw new BadRequestException('File exceeds 10MB limit');
    }

    const ext = filename.split('.').pop() || 'bin';
    const key = `${folder}/${randomUUID()}.${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    const url = this.buildPublicUrl(key);

    this.logger.log(`Uploaded ${key} (${buffer.length} bytes)`);

    return { key, url };
  }

  /**
   * Build the public-facing URL for a stored object key.
   * R2_PUBLIC_URL  →  https://pub-xxx.r2.dev  or a custom domain
   * Fallback       →  standard AWS S3 URL
   */
  private buildPublicUrl(key: string): string {
    if (process.env.R2_PUBLIC_URL) {
      return `${process.env.R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
    }
    return `https://${this.bucket}.s3.${process.env.S3_REGION || 'us-east-1'}.amazonaws.com/${key}`;
  }

  /**
   * Generate a presigned download URL for private files.
   */
  async getPresignedDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3, command, { expiresIn: 3600 }); // 1 hour
  }

  /**
   * Delete a file from storage.
   */
  async delete(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    this.logger.log(`Deleted ${key}`);
  }
}

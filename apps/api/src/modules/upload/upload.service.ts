import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
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

const ALLOWED_FOLDERS = ['property-images', 'kyb-documents', 'field-visit-photos', 'profile-photos', 'documents', 'tenant-documents'];

/**
 * Folders whose contents must never be reachable from a public bucket URL.
 * These hold identity and business documents — CAC certificates, director IDs,
 * utility bills, proof of income — which were previously served from the same
 * permanent public URLs as property photos. Objects here are read through
 * short-lived presigned GETs instead (see getPresignedDownloadUrl).
 *
 * 'documents' is on this list because that is the folder the tenant profile
 * wizard uploads ID and income documents to.
 */
const PRIVATE_FOLDERS = ['kyb-documents', 'tenant-documents', 'documents'];

/** Which roles may write to which folder. */
const FOLDER_ROLES: Record<string, string[]> = {
  'property-images': ['agent', 'ops', 'admin'],
  'kyb-documents': ['agent', 'ops', 'admin'],
  'field-visit-photos': ['field_agent', 'ops', 'admin'],
  'profile-photos': ['agent', 'ops', 'admin', 'tenant', 'field_agent'],
  documents: ['tenant', 'ops', 'admin'],
  'tenant-documents': ['tenant', 'ops', 'admin'],
};

export function isPrivateFolder(folder: string): boolean {
  return PRIVATE_FOLDERS.includes(folder);
}

/**
 * Pulls a safe extension off a client-supplied filename. Splitting on '.' and
 * taking the last segment accepted anything, including slashes, so a filename
 * like "a.jpg/../x" injected extra path segments into the object key.
 */
function safeExtension(filename: string): string {
  const match = /\.([a-zA-Z0-9]{1,10})$/.exec(filename ?? '');
  return match ? match[1].toLowerCase() : 'bin';
}

/** True when the object key lives under a folder that requires authorization. */
export function isPrivateKey(key: string): boolean {
  return PRIVATE_FOLDERS.some((f) => key.startsWith(`${f}/`));
}

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
    role?: string,
  ): Promise<{ uploadUrl: string; key: string; publicUrl: string | null }> {
    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      throw new BadRequestException(
        `File type not allowed. Accepted: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
    if (!ALLOWED_FOLDERS.includes(safeFolder)) {
      throw new BadRequestException(`Invalid upload folder. Allowed: ${ALLOWED_FOLDERS.join(', ')}`);
    }

    // Any authenticated user could previously request a slot in any folder,
    // including the KYB and tenant document folders.
    if (role && !(FOLDER_ROLES[safeFolder] ?? []).includes(role)) {
      throw new ForbiddenException(`Your role cannot upload to ${safeFolder}`);
    }

    const key = `${safeFolder}/${randomUUID()}.${safeExtension(filename)}`;

    // NOTE: S3/R2 presigned PutObject URLs do not natively support content-length-range
    // conditions (unlike presigned POST). File size enforcement is handled on the frontend
    // via the useUpload.ts validateFile() method (10MB cap). If stricter server-side
    // enforcement is required, switch to createPresignedPost (S3 only, not supported by R2).
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 600 }); // 10 min

    // Private folders get no public URL at all — callers store the key and read
    // it back through GET /upload/download-url.
    const publicUrl = isPrivateFolder(safeFolder) ? null : this.buildPublicUrl(key);

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

    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
    if (!ALLOWED_FOLDERS.includes(safeFolder)) {
      throw new BadRequestException(`Invalid upload folder. Allowed: ${ALLOWED_FOLDERS.join(', ')}`);
    }

    const ext = filename.split('.').pop() || 'bin';
    const key = `${safeFolder}/${randomUUID()}.${ext}`;

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
   * Storage is Cloudflare R2, so R2_PUBLIC_URL is the only correct base; the
   * previous s3.amazonaws.com fallback produced URLs that resolve to nothing.
   */
  private buildPublicUrl(key: string): string {
    const base = process.env.R2_PUBLIC_URL || process.env.S3_PUBLIC_URL;
    if (!base) {
      this.logger.warn('R2_PUBLIC_URL is not set — returning bare object key');
      return key;
    }
    return `${base.replace(/\/$/, '')}/${key}`;
  }

  /**
   * Generate a short-lived presigned download URL for a private object.
   * Callers are responsible for authorizing the request first.
   */
  async getPresignedDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3, command, { expiresIn: 300 }); // 5 min
  }

  /**
   * Normalizes whatever is stored on a record into a bare object key.
   * Documents were historically stored as full public URLs (and in some early
   * rows, as a raw filename), so stored values come in more than one shape.
   */
  toObjectKey(value: string): string {
    if (!value) return value;
    if (!value.startsWith('http')) return value.replace(/^\/+/, '');
    try {
      return new URL(value).pathname.replace(/^\/+/, '');
    } catch {
      return value;
    }
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

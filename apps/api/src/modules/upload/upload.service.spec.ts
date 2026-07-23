import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { UploadService, isPrivateFolder, isPrivateKey } from './upload.service';

/**
 * The upload module had no tests at all. These cover the parts that decide
 * whether a document is publicly reachable and who may write where — the
 * previous behaviour served KYB certificates and tenant ID documents from the
 * same permanent public URLs as property photos.
 */
describe('UploadService', () => {
  let service: UploadService;

  beforeEach(() => {
    process.env.R2_ENDPOINT = 'https://account.r2.cloudflarestorage.com';
    process.env.R2_ACCESS_KEY_ID = 'test-key';
    process.env.R2_SECRET_ACCESS_KEY = 'test-secret';
    process.env.R2_BUCKET = 'test-bucket';
    process.env.R2_PUBLIC_URL = 'https://pub-test.r2.dev';
    service = new UploadService();
  });

  describe('folder privacy classification', () => {
    it.each(['kyb-documents', 'tenant-documents', 'documents'])(
      '%s is private',
      (folder) => {
        expect(isPrivateFolder(folder)).toBe(true);
        expect(isPrivateKey(`${folder}/abc.pdf`)).toBe(true);
      },
    );

    it.each(['property-images', 'field-visit-photos', 'profile-photos'])(
      '%s is public',
      (folder) => {
        expect(isPrivateFolder(folder)).toBe(false);
        expect(isPrivateKey(`${folder}/abc.jpg`)).toBe(false);
      },
    );
  });

  describe('getPresignedUploadUrl', () => {
    it('returns a public URL for a public folder', async () => {
      const result = await service.getPresignedUploadUrl(
        'property-images',
        'house.jpg',
        'image/jpeg',
        'agent',
      );

      expect(result.publicUrl).toBe(`https://pub-test.r2.dev/${result.key}`);
      expect(result.uploadUrl).toContain('https://');
    });

    it('withholds the public URL for a private folder', async () => {
      const result = await service.getPresignedUploadUrl(
        'kyb-documents',
        'cac.pdf',
        'application/pdf',
        'agent',
      );

      // No public link exists for these — they are read via a signed download.
      expect(result.publicUrl).toBeNull();
      expect(result.key).toMatch(/^kyb-documents\//);
    });

    it('rejects a role that may not write to the folder', async () => {
      await expect(
        service.getPresignedUploadUrl('kyb-documents', 'cac.pdf', 'application/pdf', 'tenant'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects a disallowed content type', async () => {
      await expect(
        service.getPresignedUploadUrl('property-images', 'x.exe', 'application/x-msdownload', 'agent'),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects an unknown folder', async () => {
      await expect(
        service.getPresignedUploadUrl('../secrets', 'x.jpg', 'image/jpeg', 'agent'),
      ).rejects.toThrow(BadRequestException);
    });

    it('does not let a crafted filename inject extra path segments', async () => {
      const result = await service.getPresignedUploadUrl(
        'property-images',
        'evil.jpg/../../etc/passwd',
        'image/jpeg',
        'agent',
      );

      // Exactly one separator: "<folder>/<uuid>.<ext>".
      expect(result.key.split('/')).toHaveLength(2);
      expect(result.key).not.toContain('..');
      expect(result.key).toMatch(/^property-images\/[0-9a-f-]+\.[a-z0-9]+$/);
    });

    it('falls back to a safe extension when the filename has none', async () => {
      const result = await service.getPresignedUploadUrl(
        'property-images',
        'noextension',
        'image/jpeg',
        'agent',
      );

      expect(result.key).toMatch(/\.bin$/);
    });
  });

  describe('toObjectKey', () => {
    it('passes a bare key through', () => {
      expect(service.toObjectKey('kyb-documents/a.pdf')).toBe('kyb-documents/a.pdf');
    });

    it('extracts the key from a legacy full public URL', () => {
      expect(service.toObjectKey('https://pub-test.r2.dev/kyb-documents/a.pdf')).toBe(
        'kyb-documents/a.pdf',
      );
    });

    it('strips leading slashes', () => {
      expect(service.toObjectKey('/kyb-documents/a.pdf')).toBe('kyb-documents/a.pdf');
    });
  });
});

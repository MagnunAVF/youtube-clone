import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { createS3Client, createS3PresignClient } from './storage.module';

jest.mock('@aws-sdk/client-s3');

describe('storage.module factories', () => {
  const S3ClientMock = jest.mocked(S3Client);

  afterEach(() => {
    jest.clearAllMocks();
  });

  function configServiceWith(values: Record<string, string | undefined>): ConfigService {
    return {
      get: (key: string, fallback?: string) => values[key] ?? fallback,
      getOrThrow: (key: string) => {
        const value = values[key];
        if (value === undefined) throw new Error(`Missing required config: ${key}`);
        return value;
      },
    } as unknown as ConfigService;
  }

  describe('createS3Client', () => {
    it('targets S3_ENDPOINT with path-style access and static credentials when set', () => {
      createS3Client(
        configServiceWith({
          S3_ENDPOINT: 'http://minio:9000',
          S3_ACCESS_KEY_ID: 'minioadmin',
          S3_SECRET_ACCESS_KEY: 'minioadmin',
        }),
      );

      expect(S3ClientMock).toHaveBeenCalledWith({
        region: 'us-east-1',
        endpoint: 'http://minio:9000',
        forcePathStyle: true,
        credentials: { accessKeyId: 'minioadmin', secretAccessKey: 'minioadmin' },
      });
    });

    it('falls back to the real S3 endpoints and IAM role when S3_ENDPOINT is unset', () => {
      createS3Client(configServiceWith({}));

      expect(S3ClientMock).toHaveBeenCalledWith({ region: 'us-east-1' });
    });
  });

  describe('createS3PresignClient', () => {
    it('prefers S3_PUBLIC_ENDPOINT over S3_ENDPOINT when both are set', () => {
      createS3PresignClient(
        configServiceWith({
          S3_ENDPOINT: 'http://minio:9000',
          S3_PUBLIC_ENDPOINT: 'http://localhost:9000',
          S3_ACCESS_KEY_ID: 'minioadmin',
          S3_SECRET_ACCESS_KEY: 'minioadmin',
        }),
      );

      expect(S3ClientMock).toHaveBeenCalledWith({
        region: 'us-east-1',
        endpoint: 'http://localhost:9000',
        forcePathStyle: true,
        credentials: { accessKeyId: 'minioadmin', secretAccessKey: 'minioadmin' },
      });
    });

    it('falls back to S3_ENDPOINT when S3_PUBLIC_ENDPOINT is unset', () => {
      createS3PresignClient(
        configServiceWith({
          S3_ENDPOINT: 'http://localhost:9000',
          S3_ACCESS_KEY_ID: 'minioadmin',
          S3_SECRET_ACCESS_KEY: 'minioadmin',
        }),
      );

      expect(S3ClientMock).toHaveBeenCalledWith({
        region: 'us-east-1',
        endpoint: 'http://localhost:9000',
        forcePathStyle: true,
        credentials: { accessKeyId: 'minioadmin', secretAccessKey: 'minioadmin' },
      });
    });

    it('falls back to the real S3 endpoints when neither endpoint is set', () => {
      createS3PresignClient(configServiceWith({}));

      expect(S3ClientMock).toHaveBeenCalledWith({ region: 'us-east-1' });
    });
  });
});

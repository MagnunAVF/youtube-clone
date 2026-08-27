import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { S3_CLIENT, S3_PRESIGN_CLIENT } from './storage.constants';

// Extracted (rather than inlined in the useFactory below) so they're directly unit-testable
// without going through Nest's DI container.
export function createS3Client(configService: ConfigService): S3Client {
  const endpoint = configService.get<string>('S3_ENDPOINT');

  return new S3Client({
    region: configService.get<string>('AWS_REGION', 'us-east-1'),
    // Local dev talks to MinIO via S3_ENDPOINT; in AWS this is unset and
    // the SDK falls back to real S3 endpoints + the ECS task's IAM role.
    ...(endpoint && {
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: configService.getOrThrow<string>('S3_ACCESS_KEY_ID'),
        secretAccessKey: configService.getOrThrow<string>('S3_SECRET_ACCESS_KEY'),
      },
    }),
  });
}

export function createS3PresignClient(configService: ConfigService): S3Client {
  // S3_ENDPOINT (used for the backend's own container-to-container S3 calls, e.g.
  // http://minio:9000 in docker-compose) isn't reachable from a browser. Presigned
  // playback URLs need the browser-facing host instead, so they're signed with a
  // separate client pointed at S3_PUBLIC_ENDPOINT - which defaults to S3_ENDPOINT for
  // setups where the two already match (bare local dev, or AWS with neither set).
  const endpoint =
    configService.get<string>('S3_PUBLIC_ENDPOINT') ?? configService.get<string>('S3_ENDPOINT');

  return new S3Client({
    region: configService.get<string>('AWS_REGION', 'us-east-1'),
    ...(endpoint && {
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: configService.getOrThrow<string>('S3_ACCESS_KEY_ID'),
        secretAccessKey: configService.getOrThrow<string>('S3_SECRET_ACCESS_KEY'),
      },
    }),
  });
}

@Module({
  providers: [
    { provide: S3_CLIENT, inject: [ConfigService], useFactory: createS3Client },
    { provide: S3_PRESIGN_CLIENT, inject: [ConfigService], useFactory: createS3PresignClient },
  ],
  exports: [S3_CLIENT, S3_PRESIGN_CLIENT],
})
export class StorageModule {}

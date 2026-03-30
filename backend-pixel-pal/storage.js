import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

// Cloudflare R2 é 100% compatível com a API S3 da AWS
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export const BUCKET_NAME = process.env.R2_BUCKET_NAME;

// URL pública do bucket (domínio público do R2 ou domínio customizado)
// Ex: https://pub-xxxxxxxx.r2.dev  ou  https://fotos.seudominio.com
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

/**
 * Faz upload de um arquivo para o R2
 * @param {string} key - nome do arquivo no bucket
 * @param {Buffer} body - conteúdo do arquivo
 * @param {string} contentType - mime type
 */
export async function uploadToR2(key, body, contentType) {
  const upload = new Upload({
    client: r2Client,
    params: {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    },
  });
  await upload.done();
}

/**
 * Deleta um arquivo do R2
 * @param {string} key - nome do arquivo no bucket
 */
export async function deleteFromR2(key) {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
}

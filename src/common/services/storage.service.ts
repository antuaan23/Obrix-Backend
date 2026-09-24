import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export type ArchivoSubido = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
};

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly endpoint: string;

  constructor(private readonly configService: ConfigService) {
    // Lee AWS_ENDPOINT_URL_S3 del .env o usa https://t3.storage.dev por defecto
    this.endpoint = 
      this.configService.get<string>('AWS_ENDPOINT_URL_S3') || 
      this.configService.get<string>('TIGRIS_ENDPOINT') || 
      'https://t3.storage.dev';

    this.bucketName = this.configService.get<string>('TIGRIS_BUCKET_NAME') || '';

    if (!this.bucketName) {
      console.error('⚠️ ALERTA: No se definió TIGRIS_BUCKET_NAME en el archivo .env');
    }

    this.s3Client = new S3Client({
      endpoint: this.endpoint,
      region: this.configService.get<string>('AWS_REGION') || 'auto',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  async subirBoleta(file: ArchivoSubido, carpeta: string = 'boletas'): Promise<string> {
    if (!file || !file.buffer) {
      throw new BadRequestException('El archivo subido no contiene datos válidos.');
    }

    if (!this.bucketName) {
      throw new BadRequestException('Falta configurar TIGRIS_BUCKET_NAME en las variables de entorno.');
    }

    const extension = file.originalname.split('.').pop();
    const nombreUnico = `${carpeta}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: nombreUnico,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    });

    try {
      await this.s3Client.send(command);
      return `${this.endpoint}/${this.bucketName}/${nombreUnico}`;
    } catch (error) {
      console.error('Error al subir archivo a Tigris:', error);
      throw error;
    }
  }
}
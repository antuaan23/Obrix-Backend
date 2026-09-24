import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
    });

    try {
      await this.s3Client.send(command);
      // Guardamos la ruta relativa o clave única en la BD (ej: "boletas/1790217...png")
      return nombreUnico;
    } catch (error) {
      console.error('Error al subir archivo a Tigris:', error);
      throw error;
    }
  }

  /**
   * Genera una URL firmada temporalmente para acceder de forma segura al archivo sin 403 AccessDenied
   * @param key Clave del objeto (ej: "boletas/1790217121135-e3cm5yk.png")
   * @param expiresIn Tiempo de validez en segundos (por defecto 1 hora)
   */
  async obtenerUrlFirmada(key: string, expiresIn: number = 3600): Promise<string> {
    if (!key) return '';

    // Si viene la URL completa anterior, extraemos solo la ruta relativa ("boletas/...")
    const cleanKey = key.includes('boletas/') ? `boletas/${key.split('boletas/').pop()}` : key;

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: cleanKey,
    });

    try {
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error al generar la URL firmada:', error);
      return key;
    }
  }
}
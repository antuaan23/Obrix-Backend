import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Configuración de CORS (necesario para que Angular se conecte)
  app.enableCors();

  // 2. Prefijo global para las rutas (opcional pero muy común: /api/v1/...)
  app.setGlobalPrefix('api');

  // 3. Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en los DTOs
      forbidNonWhitelisted: true, // Lanza error si envían propiedades extra
      transform: true, // Transforma payloads automáticamente a los tipos del DTO
    }),
  );

  // 4. Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API Obrix / Sistema Gestión de Obras y Proyectos')
    .setDescription('Documentación de la API del sistema Obrix')
    .setVersion('1.0')
    .addBearerAuth() // Añade soporte para tokens JWT en Swagger
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Aplicación corriendo en: http://localhost:${port}/api`);
  console.log(`📚 Documentación Swagger disponible en: http://localhost:${port}/api/docs`);
}

bootstrap();
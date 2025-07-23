import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Préfixe global pour toutes les routes
  app.setGlobalPrefix('api');

  // Activation CORS (config par défaut, à personnaliser si besoin)
  app.enableCors();

  // Validation automatique DTO + nettoyage des données inconnues + transformation types
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,               // supprime les propriétés non déclarées dans les DTO
      forbidNonWhitelisted: true,   // throw error si propriétés inconnues détectées
      transform: true,              // transforme les payloads en instances des DTO
    }),
  );

  // Injection du HttpAdapterHost pour le filtre global d’exceptions
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  // Configuration Swagger avec Bearer Auth (pour JWT)
  const config = new DocumentBuilder()
    .setTitle('Hedera API')
    .setDescription("Documentation Swagger de l’API Hedera")
    .setVersion('1.0')
    .addBearerAuth()  // ajoute l’icône cadenas pour JWT
    .build();

  // Génération et setup Swagger UI sur /api
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Port configurable via .env ou défaut 56000
  const PORT = process.env.PORT || 56000;
  await app.listen(PORT);

  // Logs console pour info
  logger.log(`🚀 Server is running on http://localhost:${PORT}`);
  logger.log(`📘 Swagger UI available at http://localhost:${PORT}/api`);
}

bootstrap();

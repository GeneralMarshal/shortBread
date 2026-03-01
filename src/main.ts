import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('Short Bread Api')
    .setDescription('Short Bread Api Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
        description: 'Enter your JWT token',
      },
      'JWT-auth',
    )
    .addSecurityRequirements('JWT-auth')
    .addTag('auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('app/api', app, document);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    'Swagger documentation is available at http://localhost:3000/app/api',
  );
  console.log(`Server is running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();

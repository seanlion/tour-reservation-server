import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('투어 상품 예약 처리 서버')
    .setVersion('0.0.1')
    .build();

  const swaggerURI = '/docs';
  SwaggerModule.setup(
    swaggerURI,
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );
  await app.listen(3000);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { requestIdMiddleware } from './shared/middlewares/request-id.middleware'
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(requestIdMiddleware);
  app.useGlobalFilters(new GlobalExceptionFilter());


  const config = new DocumentBuilder()
    .setTitle('OpSafe API')
    .setDescription('Documentação oficial da API do OpSafe')
    .setVersion('1.0.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(3000);
}
bootstrap();

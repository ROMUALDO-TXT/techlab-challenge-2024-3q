import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs-extra';
import { NestExpressApplication } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const processPath = `${process.cwd()}`;
  const logPath = `${processPath}/logs`;

  fs.ensureDirSync(`${logPath}/info`);
  fs.ensureDirSync(`${logPath}/errors`);
  fs.ensureDirSync(`${logPath}/exceptions`);
  fs.ensureDirSync(`${processPath}/temp`);
  fs.ensureDirSync(`${processPath}/uploads`);

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.enableCors();

  const config = new DocumentBuilder()
  .addBearerAuth()
  .setTitle('BACKEND Techlab 2024')
  .setDescription(
    'desafio techlab',
  )
  .setVersion('0.0.1')
  .build();
  
  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };
  
  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api', app, document);

  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.use(bodyParser.urlencoded({ limit: '2gb', extended: true }));
  app.use(bodyParser.json({ limit: '2gb' }));

  await app.listen(process.env.PORT);
}
bootstrap();

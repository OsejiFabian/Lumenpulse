import { NestFactory } from '@nestjs/core';
import 'dotenv/config';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { setupApp } from './bootstrap/app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  setupApp(app);

  const config = new DocumentBuilder()
    .setTitle('LumenPulse API')
    .setDescription(
      [
        'Comprehensive API documentation for LumenPulse - A decentralized crypto news aggregator and portfolio management platform built on Stellar blockchain',
        '',
        '## Pagination',
        '',
        'Every list endpoint shares the same pagination contract:',
        '',
        '- **Query parameters**: `page` (1-based, default `1`), `limit` (default `20`, max `100`), and `cursor` (opaque token from a previous response). Out-of-range values are rejected with `400 Bad Request`.',
        '- **Metadata**: every paginated response includes an identical `meta` object with the shape `{ limit, page, total, totalPages, nextCursor }`. Fields that do not apply to the endpoint are `null`.',
        '- **Offset mode** (database-backed endpoints such as `/users`, `/watchlist`, `/portfolio/history`, `/news` with `tag`/`category`, `/auth/sessions`): paginate with `page` + `limit`; `meta.total` and `meta.totalPages` are populated.',
        '- **Cursor mode** (Horizon-backed endpoints such as `/transactions/*`, `/stellar/transactions`, `/stellar/assets`): paginate with `cursor`, passing `meta.nextCursor` from the previous response; `meta.page`, `meta.total` and `meta.totalPages` are `null`.',
        '- **Stability**: database-backed lists use a stable secondary sort key (id tiebreak) and cursor-backed walks are unaffected by concurrent inserts, so pages never duplicate or skip existing records.',
        '',
        'See `apps/backend/docs/pagination.md` for the full client-facing specification and the per-endpoint matrix.',
      ].join('\n'),
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication and authorization endpoints')
    .addTag('users', 'User profile and account management')
    .addTag('news', 'Crypto news aggregation and sentiment analysis')
    .addTag('portfolio', 'Portfolio tracking and performance metrics')
    .addTag('stellar', 'Stellar blockchain integration')
    .addServer('http://localhost:3000', 'Development')
    .addServer('https://api.lumenpulse.io', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;

  // await app.listen(port);
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
}

void bootstrap();

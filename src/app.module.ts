import { ApolloDriver } from '@nestjs/apollo';
import { CacheModule, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BoardsModule } from './api/boards/boards.module';
import { CategoriesModule } from './api/categories/categories.module';
import { InquiriesModule } from './api/inquiries/inquiries.module';
import { InquiriesAnswerModule } from './api/inquiriesAnswer/inquiriesAnswer.module';
import { InterestsModule } from './api/interests/interests.module';
import { PaymentHistoriesModule } from './api/paymentHistories/paymentHistories.module';
import { PaymentsModule } from './api/payments/payments.module';
import { ReportsModule } from './api/reports/reports.module';
import { RunnersModule } from './api/runners/runners.module';
import { TokensModule } from './api/tokens/tokens.module';
import { UsersModule } from './api/users/users.module';
import { AuthsModule } from './api/auths/auths.module';
import { RedisClientOptions } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import { FileModule } from './api/file/file.module';
import { ChatModule } from './api/chat/chat.module';
import { NotificationsModule } from './api/notifications/notifications.module';
import { EventsModule } from './api/events/events.module';
// import { RefreshesModule } from './api/refreshes/refreshes.module';

@Module({
  imports: [
    AuthsModule,
    BoardsModule,
    CategoriesModule,
    ChatModule,
    FileModule,
    InquiriesModule,
    InquiriesAnswerModule,
    InterestsModule,
    NotificationsModule,
    PaymentHistoriesModule,
    PaymentsModule,
    // RefreshesModule,
    ReportsModule,
    RunnersModule,
    TokensModule,
    UsersModule,
    EventsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: 'src/commons/graphql/schema.gql',
      context: ({ req, res }) => ({ req, res }),
      cors: {
        origin: [
          'http://localhost:3000',
          'http://open-run.shop',
          'https://open-run.shop',
        ],
        credentials: true,
        exposedHeaders: ['Set-Cookie', 'Cookie'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: [
          'Access-Control-Allow-Headers',
          'Authorization',
          'X-Requested-With',
          'Content-Type',
          'Accept',
        ],
      },
    }),
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_TYPE as 'mysql',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE,
      entities: [__dirname + '/api/**/*.entity.*'],
      synchronize: true,
      logging: true,
    }),
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      url: process.env.REDIS_URL,
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

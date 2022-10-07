import { ApolloDriver } from '@nestjs/apollo';
import { CacheModule, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BoardsModule } from './apis/boards/boards.module';
import { CategoriesModule } from './apis/categories/categories.module';
import { InquiriesModule } from './apis/inquiries/inquiries.module';
import { InquiriesAnswerModule } from './apis/inquiriesAnswer/inquiriesAnswer.module';
import { InterestsModule } from './apis/interests/interests.module';
import { PaymentHistoriesModule } from './apis/paymentHistories/paymentHistories.module';
import { PaymentsModule } from './apis/payments/payments.module';
import { ReportsModule } from './apis/reports/reports.module';
import { RunnersModule } from './apis/runners/runners.module';
import { TokensModule } from './apis/tokens/tokens.module';
import { UsersModule } from './apis/users/users.module';
import { AuthsModule } from './apis/auths/auths.module';
import { RedisClientOptions } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import { FileModule } from './apis/file/file.module';
import { ChatModule } from './apis/chat/chat.module';
import { NotificationsModule } from './apis/notifications/notifications.module';
import { EventsModule } from './apis/events/events.module';
import { RefreshesModule } from './apis/refreshes/refreshes.module';

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
    RefreshesModule,
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
          'http://localhost:4000',
          'http://localhost:4001',
          'http://openrun.site',
          'https://openrun.site',
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
      entities: [__dirname + '/apis/**/*.entity.*'],
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

import { ApolloDriver } from '@nestjs/apollo';
import { CacheModule, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BoardCommentAnswersModule } from './api/boardCommentAnswers/BoardCommentAnswers.module';
import { BoardCommentsModule } from './api/boardComments/boardComments.module';
import { BoardsModule } from './api/boards/boards.module';
import { CategoriesModule } from './api/categories/categories.module';
import { InquiriesModule } from './api/inquiries/inquiries.module';
import { InquiriesAnswerModule } from './api/inquiriesAnswer/inquiriesAnswer.module';
import { InterestsModule } from './api/interests/interests.module';
import { PaymentHistoriesModule } from './api/paymentHistories/paymentHistories.module';
import { PaymentsModule } from './api/payments/payments.module';
import { ReportsModule } from './api/reports/reports.module';
import { RunnersModule } from './api/runners/runners.module';
import { TagsModule } from './api/tags/tags.module';
import { TokensModule } from './api/tokens/tokens.module';
import { UsersModule } from './api/users/users.module';
import { EventsModule } from './api/events/events.module';
import { AuthsModule } from './api/auths/auths.module';
import { RedisClientOptions } from 'redis';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    AuthsModule,
    BoardCommentAnswersModule,
    BoardCommentsModule,
    BoardsModule,
    CategoriesModule,
    EventsModule,
    InquiriesModule,
    InquiriesAnswerModule,
    InterestsModule,
    PaymentHistoriesModule,
    PaymentsModule,
    ReportsModule,
    RunnersModule,
    TagsModule,
    TokensModule,
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: 'src/commons/graphql/schema.gql',
      context: ({ req, res }) => ({ req, res }),
      cors: {
        origin: 'http://localhost:3000',
        credentials: true,
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
      url: 'redis://my-redis:6379',
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

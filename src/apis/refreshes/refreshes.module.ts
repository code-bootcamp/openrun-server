import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../boards/entities/board.entity';
import { PaymentHistory } from '../paymentHistories/entities/paymentHistory.entity';
import { User } from '../users/entities/user.entity';
import { RefreshesService } from './refreshes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Board, //
      User,
      PaymentHistory,
    ]),
    ScheduleModule.forRoot(),
    ElasticsearchModule.register({
      node: 'http://elasticsearch:9200', //
    }),
  ],
  providers: [RefreshesService],
})
export class RefreshesModule {}

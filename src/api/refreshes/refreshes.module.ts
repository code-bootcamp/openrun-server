import { Module } from '@nestjs/common';
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
  ],
  providers: [RefreshesService],
})
export class RefreshesModule {}

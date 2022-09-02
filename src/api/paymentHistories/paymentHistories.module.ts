import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardInfosService } from '../cardInfos/cardInfos.service';
import { CardInfo } from '../cardInfos/entities/cardInfo.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { PaymentHistory } from './entities/paymentHistory.entity';
import { PaymentHistoriesResolver } from './paymentHistories.resolver';
import { PaymentHistoriesService } from './paymentHistories.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentHistory, //
      User,
      CardInfo,
    ]),
  ],
  providers: [
    PaymentHistoriesResolver, //
    PaymentHistoriesService,
    UsersService,
    CardInfosService,
  ],
})
export class PaymentHistoriesModule {}

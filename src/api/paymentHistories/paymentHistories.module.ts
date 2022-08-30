import { Module } from '@nestjs/common';
import { PaymentHistoriesResolver } from './paymentHistories.resolver';
import { PaymentHistoriesService } from './paymentHistories.service';

@Module({
  providers: [
    PaymentHistoriesResolver, //
    PaymentHistoriesService,
  ],
})
export class PaymentHistoriesModule {}

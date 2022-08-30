import { Module } from '@nestjs/common';
import { CardInfosResolver } from './cardInfos.resolver';
import { CardInfosService } from './cardInfos.service';

@Module({
  providers: [
    CardInfosService, //
    CardInfosResolver,
  ],
})
export class CardInfosModule {}

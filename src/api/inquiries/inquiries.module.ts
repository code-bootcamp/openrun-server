import { Module } from '@nestjs/common';
import { InquiriesResolver } from './inquiries.resolver';
import { InquiriesService } from './inquiries.service';

@Module({
  providers: [
    InquiriesResolver, //
    InquiriesService,
  ],
})
export class InquiriesModule {}

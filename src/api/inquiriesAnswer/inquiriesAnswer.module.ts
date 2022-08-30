import { Module } from '@nestjs/common';
import { InquiriesAnswerResolver } from './inquiriesAnswer.resolver';
import { InquiriesAnswerService } from './inquiriesAnswer.service';

@Module({
  providers: [
    InquiriesAnswerResolver, //
    InquiriesAnswerService,
  ],
})
export class InquiriesAnswerModule {}

import { Module } from '@nestjs/common';
import { commentAnswersResolver } from './commentAnswers.resolver';
import { commentAnswersService } from './commentAnswers.service';

@Module({
  providers: [
    commentAnswersResolver, //
    commentAnswersService,
  ],
})
export class commentAnswersModule {}

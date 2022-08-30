import { Module } from '@nestjs/common';
import { InterestsResolver } from './interests.resolver';
import { InterestsService } from './interests.service';

@Module({
  providers: [
    InterestsResolver, //
    InterestsService,
  ],
})
export class InterestsModule {}

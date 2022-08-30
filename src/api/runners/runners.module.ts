import { Module } from '@nestjs/common';
import { RunnersResolver } from './runners.resolver';
import { RunnersService } from './runners.service';

@Module({
  providers: [
    RunnersResolver, //
    RunnersService,
  ],
})
export class RunnersModule {}

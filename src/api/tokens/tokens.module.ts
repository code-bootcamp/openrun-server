import { Module } from '@nestjs/common';
import { TokensResolver } from './tokens.resolver';
import { TokensService } from './tokens.service';

@Module({
  providers: [
    TokensResolver, //
    TokensService,
  ],
})
export class TokensModule {}

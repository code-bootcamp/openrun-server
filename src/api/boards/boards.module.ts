import { Module } from '@nestjs/common';
import { BoardsResolver } from './boards.resolver';
import { BoardsService } from './boards.service';

@Module({
  providers: [
    BoardsResolver, //
    BoardsService,
  ],
})
export class BoardsModule {}

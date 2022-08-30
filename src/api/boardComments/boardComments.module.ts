import { Module } from '@nestjs/common';
import { BoardCommentsResolver } from './boardComments.resolver';
import { BoardCommentsService } from './boardComments.service';

@Module({
  providers: [
    BoardCommentsResolver, //
    BoardCommentsService,
  ],
})
export class BoardCommentsModule {}

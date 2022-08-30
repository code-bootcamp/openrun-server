import { Module } from '@nestjs/common';
import { BoardCommentAnswersResolver } from './BoardCommentAnswers.resolver';
import { BoardCommentAnswersService } from './BoardCommentAnswers.service';

@Module({
  providers: [
    BoardCommentAnswersResolver, //
    BoardCommentAnswersService, //
  ],
})
export class BoardCommentAnswersModule {}

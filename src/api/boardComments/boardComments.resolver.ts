import { Resolver } from '@nestjs/graphql';
import { BoardCommentsService } from './boardComments.service';

@Resolver()
export class BoardCommentsResolver {
  constructor(
    private readonly boardCommentsService: BoardCommentsService, //
  ) {}
}

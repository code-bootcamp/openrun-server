import { InputType, PartialType } from '@nestjs/graphql';
import { CreateBoardInput } from './createBoard.input';

@InputType()
export class updateBoardInput extends PartialType(CreateBoardInput) {}

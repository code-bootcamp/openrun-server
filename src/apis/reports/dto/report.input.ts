import { Field, InputType } from '@nestjs/graphql';
import { REPORT_TYPE_ENUM } from '../entities/report.entity';

@InputType()
export class CreateReportInput {
  @Field(() => String, { nullable: true, name: 'contents' })
  contents: string;

  @Field(() => REPORT_TYPE_ENUM, { nullable: true, name: 'type' })
  type: string;

  @Field(() => String, { nullable: true, name: 'boardId' })
  boardId: string;
}

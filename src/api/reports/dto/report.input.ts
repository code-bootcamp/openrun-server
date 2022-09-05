import { Field, InputType } from '@nestjs/graphql';
import { REPORT_TYPE_ENUM } from '../entities/report.entity';

@InputType()
export class CreateReportInput {
  @Field(() => String)
  contents: string;

  @Field(() => REPORT_TYPE_ENUM)
  type: string;

  @Field(() => String)
  boardId: string;
}

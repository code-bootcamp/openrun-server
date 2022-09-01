import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateInquiryInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  contents: string;

  @Field(() => String)
  type: string;
}

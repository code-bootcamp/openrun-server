import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateInquiryInput {
  @Field(() => String, { nullable: true, name: 'title' })
  title: string;

  @Field(() => String, { nullable: true, name: 'contents' })
  contents: string;

  @Field(() => String, { nullable: true, name: 'type' })
  type: string;
}

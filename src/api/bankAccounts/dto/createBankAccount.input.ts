import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateBankAccountInput {
  @Field(() => String)
  company: string;

  @Field(() => String)
  bankAccountNum: string;
}

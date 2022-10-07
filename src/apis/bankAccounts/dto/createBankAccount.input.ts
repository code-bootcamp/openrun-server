import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class BankAccountInput {
  @Field(() => String, { nullable: true, name: 'company' })
  company: string;

  @Field(() => String, { nullable: true, name: 'backAccountNum' })
  bankAccountNum: string;
}

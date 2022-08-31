import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateCardInfoInput {
  @Field(() => String)
  cardCompany: string;

  @Field(() => String)
  cardNum: string;

  @Field(() => String)
  expireDate: string;

  @Field(() => String)
  cvcNum: string;
}

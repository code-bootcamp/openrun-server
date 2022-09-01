import { Field, InputType } from '@nestjs/graphql';
import { CreateCardInfoInput } from 'src/api/cardInfos/dto/createCardInfo.input';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;

  @Field(() => String)
  nickName: string;

  @Field(() => String)
  phone: string;

  @Field(() => String)
  profileImg: string;

  @Field(() => CreateCardInfoInput)
  cardInfoInput: CreateCardInfoInput;
}

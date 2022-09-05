import { Field, InputType, Int } from '@nestjs/graphql';
import { LocationInput } from 'src/api/locations/dto/createLocation.input';

@InputType()
export class CreateBoardInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  contents: string;

  @Field(() => Int)
  price: number;

  @Field(() => LocationInput)
  location: LocationInput;

  @Field(() => [String])
  image: string[];

  @Field(() => String)
  category: string;

  @Field(() => Date)
  dueDate: Date;
}

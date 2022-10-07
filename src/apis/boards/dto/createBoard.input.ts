import { Field, InputType, Int } from '@nestjs/graphql';
import { LocationInput } from 'src/apis/locations/dto/createLocation.input';

@InputType()
export class CreateBoardInput {
  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true, name: 'contents' })
  contents: string;

  @Field(() => Int, { nullable: true, name: 'price' })
  price: number;

  @Field(() => LocationInput, { nullable: true, name: 'location' })
  location: LocationInput;

  @Field(() => [String], { nullable: true, name: 'image' })
  image: string[];

  @Field(() => String, { nullable: true, name: 'category' })
  category: string;

  @Field(() => String, { nullable: true, name: 'eventDay' })
  eventDay: string;

  @Field(() => String, { nullable: true, name: 'eventTime' })
  eventTime: string;
}

import { Field, Float, InputType, Int } from '@nestjs/graphql';

@InputType()
export class LocationInput {
  @Field(() => String)
  address: string;

  @Field(() => String)
  addressDetail: string;

  @Field(() => Float)
  lat: number;

  @Field(() => Float)
  lng: number;

  @Field(() => Int)
  postNum: number;
}

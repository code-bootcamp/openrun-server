import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Token {
  @PrimaryColumn()
  @Field(() => String)
  phone: string;

  @Column({ default: false })
  @Field(() => Boolean)
  isAuth: boolean;

  @Column()
  @Field(() => String)
  token: string;
}

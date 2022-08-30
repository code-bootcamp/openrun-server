import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Token {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => Boolean)
  isAuth: boolean;

  @Column()
  @Field(() => String)
  phone: string;

  @Column()
  @Field(() => String)
  token: string;
}

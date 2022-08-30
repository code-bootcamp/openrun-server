import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class CardInfo {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  company: string;

  @Column()
  @Field(() => String)
  cardNum: string;

  @Column()
  @Field(() => String)
  expireDate: string;

  @Column()
  @Field(() => String)
  cvcNum: string;
}

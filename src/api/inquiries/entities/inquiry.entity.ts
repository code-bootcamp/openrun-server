import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Inquiry {
  @PrimaryGeneratedColumn()
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  type: string; //추후에 type지정하여 ENUM 작업해줘야함!(아직 유형 미정)

  @Column()
  @Field(() => String)
  title: string;

  @Column()
  @Field(() => String)
  contents: string;
}

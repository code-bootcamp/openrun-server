import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from 'src/api/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  impUid: string;

  @Column()
  @Field(() => String)
  status: string;

  @Column()
  @Field(() => Int)
  amount: number;

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;
}

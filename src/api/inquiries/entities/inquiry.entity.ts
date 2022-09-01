import { Field, ObjectType } from '@nestjs/graphql';
import { Board } from 'src/api/boards/entities/board.entity';
import { User } from 'src/api/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Inquiry {
  @PrimaryGeneratedColumn('uuid')
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

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  @ManyToOne(() => Board)
  @Field(() => Board)
  board: Board;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;
}

import { Field, ObjectType } from '@nestjs/graphql';
import { Board } from 'src/apis/boards/entities/board.entity';
import { User } from 'src/apis/users/entities/user.entity';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class ChatRoom {
  @PrimaryColumn()
  @Field(() => String)
  id: string;

  @ManyToOne(() => User)
  @Field(() => User, { nullable: true })
  seller: User;

  @ManyToOne(() => User)
  @Field(() => User, { nullable: true })
  runner: User;

  @JoinColumn()
  @OneToOne(() => Board)
  @Field(() => Board, { nullable: true })
  board: Board;
}

import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Board } from 'src/api/boards/entities/board.entity';
import { User } from 'src/api/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum REPORT_TYPE_ENUM {
  TRASH_TALK = '비방/욕설',
  ADV = '광고/음란성',
  MISSION_FAILED = '미션 불이행',
  ETC = '기타',
}

registerEnumType(REPORT_TYPE_ENUM, {
  name: 'REPORT_TYPE_ENUM',
});

@Entity()
@ObjectType()
export class Report {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column({
    type: 'enum',
    enum: REPORT_TYPE_ENUM,
    default: REPORT_TYPE_ENUM.TRASH_TALK,
  })
  @Field(() => REPORT_TYPE_ENUM)
  type: string;

  @Column()
  @Field(() => String)
  contents: string;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @DeleteDateColumn()
  @Field(() => Date)
  deletedAt: Date;

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  @JoinColumn()
  @OneToOne(() => Board)
  @Field(() => Board)
  board: Board;
}

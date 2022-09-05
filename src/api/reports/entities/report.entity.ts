import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Board } from 'src/api/boards/entities/board.entity';
import { User } from 'src/api/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum REPORT_TYPE_ENUM {
  TYPE1 = '비방/욕설',
  TYPE2 = '광고/음란성',
  TYPE3 = '미션 불이행',
  TYPE4 = '기타',
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
    default: REPORT_TYPE_ENUM.TYPE1,
  })
  @Field(() => REPORT_TYPE_ENUM)
  type: string;

  @Column()
  @Field(() => String)
  contents: string;

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  @JoinColumn()
  @OneToOne(() => Board)
  @Field(() => Board)
  board: Board;
}

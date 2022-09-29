import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { IContext } from 'src/commons/types/type';
import { InquiriesService } from '../inquiries/inquiries.service';
import { UsersService } from '../users/users.service';
import { InquiryAnswer } from './entities/inquiryAnswer.entity';
import { InquiriesAnswerService } from './inquiriesAnswer.service';

@Resolver()
export class InquiriesAnswerResolver {
  constructor(
    private readonly inquiriesAnswerService: InquiriesAnswerService,
    private readonly inquiriesService: InquiriesService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => InquiryAnswer)
  async createInquiryAnswer(
    @Args('inquiryId') inquiryId: string, //
    @Args('contents') contents: string,
    @Context() context: IContext,
  ) {
    const user = context.req.user;

    // 현재 유저 조회
    const findUser = await this.usersService.findOne({
      email: user.email,
    });

    // 관리자인지 검증
    if (!findUser.isAdmin) throw new NotFoundException('관리자가 아닙니다.');

    // 문의내역 조회
    const inquiry = await this.inquiriesService.findOne({ inquiryId });

    // 문의답변 생성
    return this.inquiriesAnswerService.create({ inquiry, contents });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [InquiryAnswer])
  async fetchLoginUserInquiryAnswer(
    @Args('inquiryId') inquiryId: string, //
  ) {
    // 문의내역 조회
    const inquiry = await this.inquiriesService.findOne({ inquiryId });

    // 문의내역에 대한 문의답변 조회 리턴
    return this.inquiriesAnswerService.findAllByInquiry({ inquiry });
  }
}

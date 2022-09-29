import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { TokensService } from './tokens.service';

@Resolver()
export class TokensResolver {
  constructor(
    private readonly tokensService: TokensService, //
  ) {}

  @Mutation(() => String)
  async sendTokenToPhone(
    @Args('phone') phone: string, //
  ) {
    //기존에 등록된 번호인지 확인
    await this.tokensService.checkIsExist({ phone });

    //전화번호 유효성 확인
    this.tokensService.checkPhoneLength({ phone });

    //6자리 토큰 생성
    const token = this.tokensService.createToken();

    //인증번호 문자 보내기
    const smsResult = await this.tokensService.sendTokenToPhone({
      phone,
      token,
    });

    //DB에 저장하기
    await this.tokensService.create({ phone, token });

    return smsResult;
  }

  @Mutation(() => Boolean)
  checkTokenByPhone(
    @Args('phone') phone: string, //
    @Args('token') token: string,
  ) {
    //전화번호 유효성 확인
    this.tokensService.checkPhoneLength({ phone });

    //인증번호 확인
    return this.tokensService.compareToken({ phone, token });
  }
}

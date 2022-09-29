import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IOAuthUser } from 'src/commons/types/type';
import { USER_LOGINTYPE_ENUM } from '../users/entities/user.entity';
import { AuthsService } from './auths.service';
import { Request, Response } from 'express';

@Controller()
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

  @Get('/login/google')
  @UseGuards(AuthGuard('google'))
  loginGoogle(
    @Req() req: Request & IOAuthUser, //
    @Res() res: Response,
  ) {
    this.authsService.socialLogin({
      _user: req.user,
      res,
      req,
      loginType: USER_LOGINTYPE_ENUM.GOOGLE,
    });
  }

  @Get('/login/kakao')
  @UseGuards(AuthGuard('kakao'))
  loginKakao(
    @Req() req: Request & IOAuthUser, //
    @Res() res: Response,
  ) {
    this.authsService.socialLogin({
      _user: req.user,
      res,
      req,
      loginType: USER_LOGINTYPE_ENUM.KAKAO,
    });
  }

  @Get('/login/naver')
  @UseGuards(AuthGuard('naver'))
  loginNaver(
    @Req() req: Request & IOAuthUser, //
    @Res() res: Response,
  ) {
    this.authsService.socialLogin({
      _user: req.user,
      res,
      req,
      loginType: USER_LOGINTYPE_ENUM.NAVER,
    });
  }
}

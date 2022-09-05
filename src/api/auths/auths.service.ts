import {
  CACHE_MANAGER,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { Cache } from 'cache-manager';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthsService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  setRefreshToken({ user, res }) {
    const refreshToken = this.jwtService.sign(
      { email: user.email, sub: user.id }, //
      { secret: 'myRefreshKey', expiresIn: '2w' },
    );
    res.setHeader(
      'Set-Cookie',
      `refreshToken=${refreshToken}; path=/; domain=.openrunbackend.shop; SameSite=None; Secure; httpOnly;`,
    );
    // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    // res.setHeader('Set-Cookie', `refreshToken=${refreshToken}; path=/;`);
  }

  getAccessToken({ user }) {
    const accessToken = this.jwtService.sign(
      { email: user.email, sub: user.id },
      { secret: 'myAccessKey', expiresIn: '4h' },
    );
    return accessToken;
  }

  async checkAndSaveToken({ accessToken, refreshToken }) {
    try {
      //현재 시간
      const currentTime = new Date();
      const currentSec = Math.abs(currentTime.getTime() / 1000);

      //AccessToken 검증 및 남은시간 계산
      const accessDecoded = jwt.verify(accessToken, 'myAccessKey');
      const leftAccessSec = Math.ceil(accessDecoded['exp'] - currentSec);

      //Redis key 생성
      const accessKey = 'accessToken:' + accessToken;

      //Redis에 AccessToken 저장
      const accessResult = await this.cacheManager.set(
        accessKey,
        accessDecoded,
        {
          ttl: leftAccessSec,
        },
      );

      //RefreshToken 검증 및 남은시간 계산
      const refreshDecoded = jwt.verify(refreshToken, 'myRefreshKey');
      const leftRefreshSec = Math.ceil(refreshDecoded['exp'] - currentSec);

      //Redis Key 생성
      const refreshKey = 'refreshToken:' + refreshToken;

      //Redis에 RefreshToken 저장
      const refreshResult = await this.cacheManager.set(
        refreshKey,
        refreshDecoded,
        {
          ttl: leftRefreshSec,
        },
      );

      //Redis에 올바르게 저장되었는지 검증
      if (accessResult === 'OK' && refreshResult === 'OK') {
        return true;
      } else {
        throw new ConflictException('로그아웃 실패');
      }
    } catch (error) {
      throw new ConflictException('해당 사용자의 토큰이 올바르지 않습니다.');
    }
  }

  async socialLogin({ _user, res, loginType }) {
    //가입 확인
    let user = await this.usersService.findOne({ email: _user.email });

    //회원 가입
    if (!user) {
      user = await this.usersService.createSocialUser({
        _user,
        loginType,
      });
    }

    //로그인
    this.setRefreshToken({ user, res });
    res.redirect('http://localhost:5500/frontend/login/index.html');
  }
}

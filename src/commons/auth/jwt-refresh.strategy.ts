import { CACHE_MANAGER, Inject, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Cache } from 'cache-manager';
import { Strategy } from 'passport-jwt';

export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: (req) => {
        const cookie = req.headers.cookie;
        const refreshToken = cookie.replace('refreshToken=', '');
        return refreshToken;
      },
      secretOrKey: 'myRefreshKey',
      passReqToCallback: true,
    });
  }

  async validate(request, payload) {
    const refreshToken = request.headers.cookie.replace('=', ':');

    //redis에 refreshToken이 있는지 확인(데이터가 있다면 로그아웃된 계정)
    const refreshAccess = await this.cacheManager.get(refreshToken);
    if (refreshAccess) {
      throw new NotFoundException('이미 로그아웃된 계정입니다.');
    }

    return {
      email: payload.email,
      id: payload.sub,
    };
  }
}

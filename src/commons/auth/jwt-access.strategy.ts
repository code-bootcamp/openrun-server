import { CACHE_MANAGER, Inject, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Cache } from 'cache-manager';
import { ExtractJwt, Strategy } from 'passport-jwt';

export class JwtAccessStrategy extends PassportStrategy(Strategy, 'access') {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'myAccessKey',
      passReqToCallback: true,
    });
  }

  async validate(request, payload) {
    const accessToken = request.headers.authorization.replace(
      'Bearer ',
      'accessToken:',
    );

    //redis에 accessToken이 있는지 확인(데이터가 있다면 로그아웃된 계정)
    const accessCache = await this.cacheManager.get(accessToken);
    if (accessCache) {
      throw new NotFoundException('이미 로그아웃된 계정입니다.');
    }

    return {
      email: payload.email,
      id: payload.sub,
    };
  }
}

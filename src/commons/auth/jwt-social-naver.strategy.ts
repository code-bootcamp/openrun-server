import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver';

export class JwtNaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor() {
    super({
      clientID: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
      callbackURL: process.env.NAVER_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  validate(accessToken, refreshToken, profile) {
    return {
      email: profile._json.email,
      password: 'socialLogin',
      nickName: profile._json.nickname,
      phone: '',
      profileImg: '',
    };
  }
}

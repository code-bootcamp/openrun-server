import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

export class JwtGoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  validate(accessToken, refreshToken, profile) {
    return {
      email: profile.emails[0].value,
      password: 'socialLogin',
      nickName: profile.displayName,
      phone: '',
      profileImg: '',
    };
  }
}

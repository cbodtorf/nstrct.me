import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfigService } from '@nstrct.me/config';

@Injectable()
export class VerifyStrategy extends PassportStrategy(Strategy, 'verify') {
  constructor(appConfigService: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('token'),
      ignoreExpiration: false,
      secretOrKey: appConfigService.getConfig().auth.jwt.accessSecret,
    });
  }

  async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException();
    }
    return { name: payload.name, email: payload.email, plan: payload.plan };
  }
}

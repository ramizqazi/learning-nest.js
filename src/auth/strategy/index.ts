import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

// Just Another service in auth for specific operations
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  // this function willl be called from auth gurad with decoded info from token in payload prop
  async validate(payload: any) {
    // console.log('Decoded access_token', payload);

    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    delete user.hash;

    // Anthing returned from this function will be appended to req.user of that api route that have auth gurad
    return user;
  }
}

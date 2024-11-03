import { ForbiddenException, Injectable } from '@nestjs/common';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { SigninDto, SignupDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(body: SignupDto) {
    const hash = await argon.hash(body.password);

    try {
      const user = await this.prisma.user.create({
        data: { email: body.email, hash, firstName: body.firstName },
      });

      delete user.hash;

      return user;
    } catch (err) {
      // IF PRISMA ERROR
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ForbiddenException('CREDENTIALS TAKEN');
      } else {
        throw err;
      }
    }
  }
  async signin(body: SigninDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: body.email },
      });

      if (!user) throw new ForbiddenException('CREDENTIALS INVALID');

      const passMatch = await argon.verify(user.hash, body.password);
      if (!passMatch) throw new ForbiddenException('CREDENTIALS INVALID');

      delete user.hash;

      return this.signToken(user.id, user.email);
    } catch (err) {
      throw err;
    }
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = { sub: userId, email };

    const access_token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get('JWT_SECRET'),
    });

    return { access_token };
  }
}

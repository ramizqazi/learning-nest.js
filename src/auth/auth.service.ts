import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { SigninDto, SignupDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

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

      return user;
    } catch (err) {
      throw err;
    }
  }
}

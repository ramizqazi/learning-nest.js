import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

// @Injectable() (no  need of this decorator if not user any thing from contruction funciton e.g prisma)
@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'), // Using config module added in app.module to get env data
        },
      },
    });
  }
}

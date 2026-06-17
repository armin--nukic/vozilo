import {Injectable, OnModuleInit} from '@nestjs/common';
import {PrismaClient} from '@prisma/client';

const connectionAttempts = 12;
const retryDelayMs = 2500;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    for (let attempt = 1; attempt <= connectionAttempts; attempt += 1) {
      try {
        await this.$connect();
        return;
      } catch (error) {
        if (attempt === connectionAttempts) {
          throw error;
        }

        await wait(retryDelayMs);
      }
    }
  }
}

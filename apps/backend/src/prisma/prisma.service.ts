import {Injectable, OnModuleInit} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import {PrismaClient} from '@prisma/client';

const connectionAttempts = 12;
const retryDelayMs = 2500;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private readonly config: ConfigService) {
    super();
  }

  async onModuleInit() {
    for (let attempt = 1; attempt <= connectionAttempts; attempt += 1) {
      try {
        await this.$connect();
        await this.ensureSuperAdmin();
        return;
      } catch (error) {
        if (attempt === connectionAttempts) {
          throw error;
        }

        await wait(retryDelayMs);
      }
    }
  }

  private async ensureSuperAdmin() {
    const email = this.config.get<string>('SUPERADMIN_EMAIL')?.trim().toLowerCase() || 'admin@vozilo.ba';
    const password = this.config.get<string>('SUPERADMIN_PASSWORD') || 'Admin12345!';
    const name = this.config.get<string>('SUPERADMIN_NAME') || 'Vozilo Super Admin';
    const passwordHash = await bcrypt.hash(password, 12);

    await this.user.upsert({
      where: {email},
      update: {
        name,
        role: 'SUPERADMIN',
        plan: 'BUSINESS',
        passwordHash
      },
      create: {
        email,
        name,
        role: 'SUPERADMIN',
        plan: 'BUSINESS',
        passwordHash
      }
    });
  }
}

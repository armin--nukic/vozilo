import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {JwtModule} from '@nestjs/jwt';
import {AppController} from './app.controller';
import {AiController} from './ai';
import {AdminController} from './admin';
import {BillingController} from './billing';
import {AuthController, AuthService} from './auth';
import {ForumController} from './forum';
import {IssuesController} from './issues';
import {MaintenanceController} from './maintenance';
import {PrismaModule} from './prisma/prisma.module';
import {ReportsController} from './reports';
import {VehiclesController} from './vehicles';

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}), JwtModule.register({}), PrismaModule],
  controllers: [
    AppController,
    AdminController,
    AuthController,
    VehiclesController,
    ReportsController,
    ForumController,
    AiController,
    IssuesController,
    MaintenanceController,
    BillingController
  ],
  providers: [AuthService]
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

import { ConfigModule } from '@nestjs/config';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './users/users.module';
import { PropertyModule } from './property/property.module';

@Module({
  imports: [AuthModule, PrismaModule, ConfigModule.forRoot({
    isGlobal: true, 
  }), UploadModule, UsersModule, PropertyModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

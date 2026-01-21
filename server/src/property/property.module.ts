import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { UploadService } from 'src/upload/upload.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PropertyController],
  providers: [PropertyService, UploadService, PrismaService],
})
export class PropertyModule {}

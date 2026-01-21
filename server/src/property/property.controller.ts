import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { FilesInterceptor } from '@nestjs/platform-express';

import { Express } from 'express'

import * as multer from 'multer';
import { UploadService } from 'src/upload/upload.service';

@Controller('property')
export class PropertyController {
  constructor(
    private readonly propertyService: PropertyService,
     private readonly uploadService: UploadService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('files', 10, { storage: multer.memoryStorage() }))
  async create(
    @Req() req: any,
    @Body() dto: CreatePropertyDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    dto.price = Number(dto.price);
    const ownerId = Number(req.user?.userId);
    const imageUrls = files?.length
      ? await Promise.all(files.map(f => this.uploadService.uploadImage(f)))
      : [];

    return this.propertyService.create(
      { ...dto, imageUrl: imageUrls },
      ownerId,
    );
  }

  @Get()
  findAll() {
    return this.propertyService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/published')
  findAllPublished(@Req() req: any) {
    const userId = req.user?.userId;
    const page = req.query.page || 1;
    return this.propertyService.findAllPublished(userId, page);
  }

  
  @UseGuards(JwtAuthGuard)
  @Get('/owner')
  findOwnerProperties(@Req() req: any) {
    const ownerId = req.user?.userId;
    const page = req.query.page || 1;
    return this.propertyService.findOwnerProperties(ownerId, page);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log('Fetching property with id:', id);
    return this.propertyService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/update/:id')
  @UseInterceptors(FilesInterceptor('files', 10, { storage: multer.memoryStorage() }))
  update(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto) {
    updatePropertyDto.price = Number(updatePropertyDto.price);
    return this.propertyService.update(+id, updatePropertyDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/updateStatus/:id')
  updateStatus(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto) {
    return this.propertyService.update(+id, updatePropertyDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/like/:id')
  likeProperty(@Param('id') id: string, @Req() req: any) {
    const userId =  req.user?.userId;
    return this.propertyService.like(+id, +userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/delete/:id')
  remove(@Param('id') id: string) {
    return this.propertyService.remove(+id);
  }
}

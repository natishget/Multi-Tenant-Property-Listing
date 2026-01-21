import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put,
  UseInterceptors, UploadedFiles, BadRequestException, ForbiddenException, ParseIntPipe
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
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
    const role = req.user?.role;
    if (!['owner', 'admin'].includes(role)) {
      throw new ForbiddenException('Only owners and admins can create properties');
    }

    dto.price = Number(dto.price);
    if (Number.isNaN(dto.price)) {
      throw new BadRequestException('Price must be a valid number');
    }

    const ownerId = Number(req.user?.userId);
    if (!ownerId) {
      throw new BadRequestException('Missing authenticated user id');
    }

    const imageUrls = files?.length
      ? await Promise.all(files.map(f => this.uploadService.uploadImage(f)))
      : [];

    return this.propertyService.create({ ...dto, imageUrl: imageUrls }, ownerId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: any) {
    const role = req.user?.role;
    if (role !== 'admin') {
      throw new ForbiddenException('Only admins can access all properties');
    }
    const page = Number(req.query.page ?? 1);
    return this.propertyService.findAll(Number.isNaN(page) ? 1 : page);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/published')
  findAllPublished(@Req() req: any) {
    const userId = Number(req.user?.userId);
    const page = Number(req.query.page ?? 1);
    return this.propertyService.findAllPublished(Number.isNaN(userId) ? undefined : userId, Number.isNaN(page) ? 1 : page);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/owner')
  findOwnerProperties(@Req() req: any) {
    const role = req.user?.role;
    if (role !== 'owner') {
      throw new ForbiddenException('Only owners can access their properties');
    }
    const ownerId = Number(req.user?.userId);
    const page = Number(req.query.page ?? 1);
    return this.propertyService.findOwnerProperties(ownerId, Number.isNaN(page) ? 1 : page);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/update/:id')
  @UseInterceptors(FilesInterceptor('files', 10, { storage: multer.memoryStorage() }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @Req() req: any
  ) {
    const role = req.user?.role;
    if (role !== 'owner') {
      throw new ForbiddenException('Only owners can update properties');
    }
    if (updatePropertyDto.price !== undefined) {
      updatePropertyDto.price = Number(updatePropertyDto.price as any);
      if (Number.isNaN(updatePropertyDto.price)) {
        throw new BadRequestException('Price must be a valid number');
      }
    }
    return this.propertyService.update(id, updatePropertyDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/updateStatus/:id')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @Req() req: any
  ) {
    const role = req.user?.role;
    if (!['owner', 'admin'].includes(role)) {
      throw new ForbiddenException('Only owners and admins can update property status');
    }
    return this.propertyService.update(id, updatePropertyDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/like/:id')
  likeProperty(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const role = req.user?.role;
    if (role !== 'user') {
      throw new ForbiddenException('Only users can like properties');
    }
    const userId = Number(req.user?.userId);
    if (!userId) {
      throw new BadRequestException('Missing authenticated user id');
    }
    return this.propertyService.like(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/delete/:id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const role = req.user?.role;
    if (!['owner', 'admin'].includes(role)) {
      throw new ForbiddenException('Only owners and admins can delete properties');
    }
    return this.propertyService.remove(id);
  }
}

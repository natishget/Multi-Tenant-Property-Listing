import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put } from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() createPropertyDto: CreatePropertyDto) {
    const ownerId =  req.user?.userId;
    console.log('ownerId', ownerId);
    return this.propertyService.create(createPropertyDto, ownerId);
  }

  @Get()
  findAll() {
    return this.propertyService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/published')
  findAllPublished(@Req() req: any) {
    const userId = req.user?.userId;
    return this.propertyService.findAllPublished(userId);
  }

  
  @UseGuards(JwtAuthGuard)
  @Get('/owner')
  findOwnerProperties(@Req() req: any) {
    const ownerId = req.user?.userId;
    console.log('Fetching properties for ownerId:', ownerId);
    return this.propertyService.findOwnerProperties(ownerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log('Fetching property with id:', id);
    return this.propertyService.findOne(+id);
  }

  @Patch('/update/:id')
  update(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto) {
    return this.propertyService.update(+id, updatePropertyDto);
  }

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

  @Delete('/delete/:id')
  remove(@Param('id') id: string) {
    return this.propertyService.remove(+id);
  }
}

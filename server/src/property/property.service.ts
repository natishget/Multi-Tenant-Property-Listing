import { Injectable } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';


@Injectable()
export class PropertyService {
  constructor(private prisma: PrismaService) {}

  // ...existing code...
  async create(createPropertyDto: CreatePropertyDto, ownerId: number) {
    const data: Prisma.PropertyUncheckedCreateInput = {
      ...createPropertyDto,
      ownerId,
    };
    return this.prisma.property.create({ data });
  }
// ...existing code...


  findAll(page = 1) {
    const take = 20;
    const safePage = Math.max(1, Number(page) || 1);
    const skip = (safePage - 1) * take;

    return this.prisma.property.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' }, // change to "id" or "updatedAt" if needed
    });
  }

  findOwnerProperties(ownerId: number) {
    // const take = 20;
    // const safePage = Math.max(1, Number(page) || 1);
    // const skip = (safePage - 1) * take;

    return this.prisma.property.findMany({
      where: { ownerId },
      // skip,
      // take,
      orderBy: { createdAt: 'desc' },
    });
  }




  async findAllPublished(userId?: number) {
    return this.prisma.property.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { favorites: true } }, // like count
        favorites: userId
          ? { where: { userId }, select: { id: true } } // only to compute likedByMe
          : false,
      },
    }).then(properties =>
      properties.map(p => {
        const { favorites, ...rest } = p as any;
        return {
          ...rest,
          likedByMe: userId ? favorites.length > 0 : false,
        };
      }),
    );
  }


  

  findOne(id: number) {
    return `This action returns a #${id} property`;
  }

  update(id: number, updatePropertyDto: UpdatePropertyDto) {
    return this.prisma.property.update({
      where: {id},
      data: {...updatePropertyDto},
    })
  }

  async like(propertyId: number, userId: number) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          propertyId,
          userId,
        },
      },
    });

    if (favorite) {
      return await this.prisma.favorite.delete({
        where: { userId_propertyId: { userId, propertyId } },
      });
    }
    
    return await this.prisma.favorite.create({
      data: {
        propertyId,
        userId,
      },
    });
  }

  remove(id: number) {
    return this.prisma.property.update({
      where: {id},
      data: {status: 'archived'},
    })
  }
}

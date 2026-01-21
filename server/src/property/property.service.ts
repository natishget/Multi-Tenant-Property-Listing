import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';


@Injectable()
export class PropertyService {
  constructor(private prisma: PrismaService) {}

  private handlePrismaError(e: unknown) {
    if (e && typeof e === 'object' && 'code' in (e as any)) {
      const err = e as Prisma.PrismaClientKnownRequestError;

      if (err.code === 'P2025') throw new NotFoundException('Property not found');
      
      if (err.code === 'P2002') throw new BadRequestException('Duplicate resource');
      throw new BadRequestException(err.message);
    }
    throw e;
  }

  async create(createPropertyDto: CreatePropertyDto, ownerId: number) {
    try {
      const data: Prisma.PropertyUncheckedCreateInput = { ...createPropertyDto, ownerId };
      const property = await this.prisma.property.create({ data });
      const fullProperty = await this.prisma.property.findUnique({
        where: { id: property.id },
        include: {
          _count: { select: { favorites: true } },
          favorites: ownerId ? { where: { userId: ownerId }, select: { id: true } } : false,
          owner: { select: { id: true, name: true, email: true } },
        },
      });
      return {
        ...fullProperty,
        likedByMe: ownerId ? ((fullProperty as any)?.favorites?.length ?? 0) > 0 : false,
      };
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  async findAll(page: number) {
    try {
      const take = 20;
      const safePage = Math.max(1, Number(page) || 1);
      const skip = (safePage - 1) * take;

      const [total, properties] = await Promise.all([
        this.prisma.property.count(),
        this.prisma.property.findMany({
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { favorites: true } },
            owner: { select: { id: true, name: true, email: true } },
          },
        }),
      ]);

      return { data: properties, page: safePage, totalPages: Math.ceil(total / take), totalItems: total };
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  async findOwnerProperties(ownerId: number, page = 1) {
    try {
      const take = 20;
      const safePage = Math.max(1, Number(page) || 1);
      const skip = (safePage - 1) * take;

      const [total, items] = await Promise.all([
        this.prisma.property.count({ where: { ownerId } }),
        this.prisma.property.findMany({
          where: { ownerId },
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { favorites: true } },
            favorites: { where: { userId: ownerId }, select: { id: true } },
          },
        }),
      ]);

      return {
        data: items.map(p => ({ ...p, likedByMe: (p as any).favorites?.length > 0 })),
        page: safePage,
        totalPages: Math.ceil(total / take),
        totalItems: total,
      };
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  async findAllPublished(userId?: number, page = 1) {
    try {
      const take = 20;
      const safePage = Math.max(1, Number(page) || 1);
      const skip = (safePage - 1) * take;

      const [total, items] = await Promise.all([
        this.prisma.property.count({ where: { status: 'published' } }),
        this.prisma.property.findMany({
          where: { status: 'published' },
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { favorites: true } },
            favorites: userId ? { where: { userId }, select: { id: true } } : false,
            owner: { select: { id: true, name: true, email: true } },
          },
        }).then(properties =>
          properties.map(p => {
            const { favorites, ...rest } = p as any;
            return { ...rest, likedByMe: userId ? favorites.length > 0 : false };
          }),
        ),
      ]);

      return { data: items, page: safePage, totalPages: Math.ceil(total / take), totalItems: total };
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  async findOne(id: number, viewerId?: number) {
    try {
      const property = await this.prisma.property.findUnique({
        where: { id },
        include: {
          _count: { select: { favorites: true } },
          favorites: viewerId ? { where: { userId: viewerId }, select: { id: true } } : false,
          owner: { select: { id: true, name: true, email: true } },
        },
      });
      if (!property) throw new NotFoundException('Property not found');
      const { favorites, ...rest } = property as any;
      return { ...rest, likedByMe: viewerId ? favorites.length > 0 : false };
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  async update(id: number, updatePropertyDto: UpdatePropertyDto) {
    try {
      await this.prisma.property.update({ where: { id }, data: { ...updatePropertyDto } });
      const withCount = await this.prisma.property.findUnique({
        where: { id },
        include: { _count: { select: { favorites: true } }, owner: { select: { id: true, name: true, email: true } } },
      });
      if (!withCount) throw new NotFoundException('Property not found');
      return withCount;
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  async like(propertyId: number, userId: number) {
    try {
      const favorite = await this.prisma.favorite.findUnique({
        where: { userId_propertyId: { propertyId, userId } },
      });

      if (favorite) {
        await this.prisma.favorite.delete({ where: { userId_propertyId: { userId, propertyId } } });
        return { liked: false };
      }

      await this.prisma.favorite.create({ data: { propertyId, userId } });
      return { liked: true };
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.property.update({
        where: { id },
        data: { status: 'archived' },
      });
    } catch (e) {
      this.handlePrismaError(e);
    }
  }
}

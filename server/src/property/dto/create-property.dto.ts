import { IsEnum, IsNumber, IsString } from "class-validator"
import { PropertyStatus } from '@prisma/client';


export class CreatePropertyDto {
    @IsString()
    title!: string;

    @IsString()
    description!: string;

    @IsNumber()
    price!: number;

    @IsString()
    location!: string;

    @IsString({ each: true })
    imageUrl!: string[];

    @IsString()
    @IsEnum(PropertyStatus)
    status?: PropertyStatus;

}


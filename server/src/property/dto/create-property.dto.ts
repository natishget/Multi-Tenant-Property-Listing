import { IsEnum, IsNumber, IsString, IsOptional } from "class-validator"
import { Type } from "class-transformer"
import { PropertyStatus } from "@prisma/client"


export class CreatePropertyDto {
    @IsString()
    title!: string;

    @IsString()
    description!: string;

    @Type(() => Number)
    @IsNumber()
    price!: number;

    @IsString()
    location!: string;

    @IsOptional()
    @IsString({ each: true })
    imageUrl?: string[];

    @IsString()
    @IsEnum(PropertyStatus)
    status?: PropertyStatus;

}


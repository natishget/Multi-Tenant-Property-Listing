import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwtService: JwtService) {}

    async registerUser(dto: CreateUserDto){
        
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        

        if(existingUser){
            throw new ConflictException('User With that email already exists');
        }

        // hash password
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // create user
        const user = await this.prisma.user.create({
            data:{
                email: dto.email,
                name: dto.name,
                password: hashedPassword,
                role: dto.role,
            },
        });
        return {
            id: user.id,
            name: user.name,
            email: user.email
        }
    }

    async loginUser(dto: LoginUserDto){

        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email},
            select: {
                id: true,
                name: true,
                password: true,
                email: true,
                role: true,
            },
        });

        if(!existingUser){
            throw new UnauthorizedException("Invalid email and password");
        }

        const isMatch = await bcrypt.compare(dto.password, existingUser.password);

        if(!isMatch){
            throw new UnauthorizedException("Invalid email or password");
        }

        const token = this.jwtService.sign({ userId: existingUser.id, email: existingUser.email, name: existingUser.name, role: existingUser.role})
        return {
            role: existingUser.role,
            message: "Login Sucessful",
            access_token: token
        };
    }
}

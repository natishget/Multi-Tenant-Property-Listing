import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

enum roleTypes {
  admin = "admin",
  user = "user",
  owner = "owner",
}

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  name?: string;

  @IsString()
  @IsNotEmpty()
  role!: roleTypes;
}
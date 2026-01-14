import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password must contain uppercase, lowercase, number and special character',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @IsOptional()
  @IsString()
  crm?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

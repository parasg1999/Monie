import { Allow, IsEmail, IsNotEmpty } from 'class-validator';

export class AuthDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Allow()
  @IsNotEmpty()
  password: string;
}

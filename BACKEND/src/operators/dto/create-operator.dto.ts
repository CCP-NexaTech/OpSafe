import { IsNotEmpty, IsOptional, IsString, IsMongoId } from 'class-validator';

export class CreateOperatorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  identifierCode: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsMongoId()
  postId?: string;

  @IsOptional()
  @IsString()
  shift?: string;

  @IsOptional()
  @IsString()
  documentLastDigits?: string;
}

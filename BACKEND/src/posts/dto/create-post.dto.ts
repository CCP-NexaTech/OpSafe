import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { PostStatus } from '../../types/database/posts';

export class CreatePostDto {
  @IsMongoId()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsMongoId()
  contractId?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: PostStatus;
}

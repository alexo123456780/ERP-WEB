import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateSystemConfigDto {
  @IsObject()
  config: Record<string, string | null>;
}

export class UploadLoginBgResponseDto {
  @IsString()
  @IsOptional()
  login_bg_url: string | null;
}

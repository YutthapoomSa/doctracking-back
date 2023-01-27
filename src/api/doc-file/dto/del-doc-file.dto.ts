import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DelDocFileDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    documentId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    fileId: string;
}

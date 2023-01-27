import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ChangAgencyUserDTO {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID(4)
    userId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID(4)
    agencyId: string;
}

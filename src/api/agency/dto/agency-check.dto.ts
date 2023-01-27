import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AgencyCheckReqDTO {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    readonly agencyId: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    readonly userId: number;
}

export class AgencyCheckResDTO {
    @ApiProperty()
    readonly status: boolean;

    constructor(status: boolean) {
        this.status = status;
    }
}
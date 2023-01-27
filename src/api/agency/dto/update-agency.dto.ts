import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateAgencySecondaryList {
    @ApiProperty()
    @IsString()
    abbreviationName: string;
    @ApiProperty()
    @IsString()
    agencyCode: string;
    @ApiProperty()
    @IsString()
    id: string;
    @ApiProperty()
    @IsString()
    agencyName: string;

    isDelete?: boolean;
}
export class UpdateAgencyDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    readonly agencyName: string;

    @ApiProperty({
        description: 'ชื่อย่อ',
    })
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    readonly abbreviationName: string;

    @ApiProperty({
        description: 'รหัสหน่วยงาน',
    })
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    readonly agencyCode: string;

    @ApiProperty({
        description: 'ข้อมูลหน่วยงานย่อย',
        type: () => [UpdateAgencySecondaryList],
    })
    readonly agencySecondaryLists: UpdateAgencySecondaryList[];
}

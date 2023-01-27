import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AgencySecondaryDB } from './../../../database/entity/agency-secondary.entity';
import { ResStatus } from './../../../shared/enum/res-status.enum';

export class CreateAgencySecondaryDTOReq {
    @ApiProperty({
        description: 'รหัสหน่วยงาน',
    })
    @IsNotEmpty()
    @IsString()
    agencyCode: string;

    @ApiProperty({
        description: 'ชื่อย่อ',
    })
    @IsNotEmpty()
    @IsString()
    abbreviationName: string;

    @ApiProperty({
        description: 'ชื่อหน่วยงาน',
    })
    @IsNotEmpty()
    @IsString()
    agencyName: string;

    @ApiProperty({
        description: 'id หน่วยงานใหญ่',
    })
    @IsNotEmpty()
    @IsString()
    agencyId: string;
}

class CreateAgencySecondaryResDTOData {
    @ApiProperty()
    agencyCode: string;

    @ApiProperty()
    abbreviationName: string;

    @ApiProperty()
    agencyName: string;

    @ApiProperty()
    agencyId: string;
}
export class CreateAgencySecondaryResDTO {
    @ApiProperty({
        enum: Object.keys(ResStatus).map((k) => ResStatus[k]),
        description: 'รหัสสถานะ',
    })
    resCode: ResStatus;

    @ApiProperty({
        type: () => CreateAgencySecondaryResDTOData,
        description: 'ข้อมูล',
    })
    resData: CreateAgencySecondaryResDTOData;

    @ApiProperty({
        description: 'ข้อความอธิบาย',
    })
    msg: string;

    constructor(resCode: ResStatus, msg: string, datas: AgencySecondaryDB) {
        this.resCode = resCode;
        this.msg = msg;
        this.resData = new CreateAgencySecondaryResDTOData();

        if (!!datas) {
            this.resData.agencyCode = datas.agencyCode;
            this.resData.abbreviationName = datas.abbreviationName;
            this.resData.agencyName = datas.agencyName;
            this.resData.agencyId = datas.agencyId;
            this.resData = datas;
        }
    }
}

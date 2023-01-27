import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AgencyDB } from './../../../database/entity/agency.entity';
import { ResStatus } from './../../../shared/enum/res-status.enum';

export class CreateAgencyDTOReq {
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
}
// ────────────────────────────────────────────────────────────────────────────────

class CreateAgencyResDTOData {
    @ApiProperty()
    agencyCode: string;

    @ApiProperty()
    abbreviationName: string;

    @ApiProperty()
    agencyName: string;
}
export class CreateAgencyResDTO {
    @ApiProperty({
        enum: Object.keys(ResStatus).map((k) => ResStatus[k]),
        description: 'รหัสสถานะ',
    })
    resCode: ResStatus;

    @ApiProperty({
        type: () => CreateAgencyResDTOData,
        description: 'ข้อมูล',
    })
    resData: CreateAgencyResDTOData;

    @ApiProperty({
        description: 'ข้อความอธิบาย',
    })
    msg: string;

    constructor(resCode: ResStatus, msg: string, datas: AgencyDB) {
        this.resCode = resCode;
        this.msg = msg;
        this.resData = new CreateAgencyResDTOData();

        if (!!datas) {
            this.resData.agencyCode = datas.agencyCode;
            this.resData.abbreviationName = datas.abbreviationName;
            this.resData.agencyName = datas.agencyName;
            this.resData = datas;
        }
    }
}

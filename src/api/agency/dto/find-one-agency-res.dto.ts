import { ApiProperty } from '@nestjs/swagger';
import { AgencyDB } from './../../../database/entity/agency.entity';
import { ResStatus } from '../../../shared/enum/res-status.enum';

class FindOneAgencyResDTOResData {
    @ApiProperty({
        description: 'ข้อมูล',
    })
    agencyName: string;
}

export class FindOneAgencyResDTO {
    @ApiProperty({
        enum: Object.keys(ResStatus).map((k) => ResStatus[k]),
        description: 'รหัสสถานะ',
    })
    resCode: ResStatus;

    @ApiProperty({
        type: () => FindOneAgencyResDTOResData,
        description: 'ข้อมูล',
    })
    resData: FindOneAgencyResDTOResData;

    @ApiProperty({
        description: 'ข้อความอธิบาย',
    })
    msg: string;

    constructor(resCode: ResStatus, msg: string, datas: AgencyDB) {
        this.resCode = resCode;
        this.msg = msg;
        this.resData = new FindOneAgencyResDTOResData();

        if (!!datas) {
            this.resData.agencyName = datas.agencyName;
        }
    }
}

import { ApiProperty } from '@nestjs/swagger';
import { DocHistoryDB } from './../../../database/entity/doc-history.entity';
import { DocHistoryDBStatus } from './../../../database/enum/db-enum-global';
import { ResStatus } from './../../../shared/enum/res-status.enum';

class CreateDocHistoryDTOResDatas {
    @ApiProperty()
    id: string;

    @ApiProperty({
        enum: Object.keys(DocHistoryDBStatus).map((k) => DocHistoryDBStatus[k]),
    })
    status: DocHistoryDBStatus;

    @ApiProperty()
    comment: string;

    @ApiProperty()
    documentRoutingId: string;

    @ApiProperty()
    userId: string;

    @ApiProperty({
        description: 'ผู้ส่ง',
    })
    agencyIdSender: string;

    @ApiProperty({
        description: 'ผู้รับ',
    })
    agencyIdRecipient: string;
}

export class AcceptDocHistoryResDto {
    @ApiProperty({
        enum: Object.keys(ResStatus).map((k) => ResStatus[k]),
        description: 'รหัสสถานะ',
    })
    resCode: ResStatus;

    @ApiProperty({
        type: () => [CreateDocHistoryDTOResDatas],
        description: 'ข้อมูล',
    })
    resData: CreateDocHistoryDTOResDatas[];

    @ApiProperty({
        description: 'ข้อความอธิบาย',
    })
    msg: string;

    constructor(resCode: ResStatus, msg: string, datas: DocHistoryDB[]) {
        this.resCode = resCode;
        this.msg = msg;
        this.resData = [];

        if (!!datas) {
            for (const item of datas) {
                const _data = new CreateDocHistoryDTOResDatas();
                _data.id = item.id;
                _data.status = item.status;
                _data.comment = item.comment;
                _data.documentRoutingId = item.documentRoutingId;
                _data.userId = item.userId;
                _data.agencyIdSender = item.agencyIdSender;
                _data.agencyIdRecipient = item.agencyIdRecipient;
                this.resData.push(_data);
            }
        }
    }
}

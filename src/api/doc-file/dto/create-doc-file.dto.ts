import { ApiProperty } from '@nestjs/swagger';
import { DocFileDB } from './../../../database/entity/doc-file.entity';
import { ResStatus } from './../../../shared/enum/res-status.enum';

export class CreateDocFileDTOReq {
    @ApiProperty({
        type: 'array',
        items: {
            type: 'string',
            format: 'binary',
        },
    })
    images: any;
}

// ────────────────────────────────────────────────────────────────────────────────

class CreateDocFileResDTOData {
    @ApiProperty()
    documentId: string;

    @ApiProperty()
    fileName: string;
}

export class CreateDocFileResDto {
    @ApiProperty({
        enum: Object.keys(ResStatus).map((k) => ResStatus[k]),
        description: 'รหัสสถานะ',
    })
    resCode: ResStatus;

    @ApiProperty({
        type: () => CreateDocFileResDTOData,
        description: 'ข้อมูล',
    })
    resData: CreateDocFileResDTOData;

    @ApiProperty({
        description: 'ข้อความอธิบาย',
    })
    msg: string;

    constructor(resCode: ResStatus, msg: string, datas: DocFileDB) {
        this.resCode = resCode;
        this.msg = msg;
        this.resData = new CreateDocFileResDTOData();

        if (!!datas) {
            this.resData.documentId = datas.documentId;
            this.resData.fileName = datas.fileName;
        }
    }
}

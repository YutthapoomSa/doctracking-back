import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { DocFileDB } from './../../../database/entity/doc-file.entity';
import { ResStatus } from './../../../shared/enum/res-status.enum';

export class FindDocFileDTOResData {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    id: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    fileName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    documentId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    createdAt: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    updatedAt: string;
}

export class ResFindDocFileResDTO {
    @ApiProperty({
        enum: Object.keys(ResStatus).map((k) => ResStatus[k]),
        description: 'รหัสสถานะ',
    })
    resCode: ResStatus;

    @ApiProperty({
        type: () => [FindDocFileDTOResData],
        description: 'ข้อมูล',
    })
    resData: FindDocFileDTOResData[];

    @ApiProperty({
        description: 'ข้อความอธิบาย',
    })
    msg: string;

    constructor(resCode: ResStatus, msg: string, datas: DocFileDB[]) {
        this.resCode = resCode;
        this.msg = msg;
        this.resData = [];

        if (!!datas && datas.length > 0) {
            for (const iterator of datas) {
                const _data = new FindDocFileDTOResData();
                _data.id = iterator.id;
                _data.documentId = iterator.documentId;
                _data.fileName = iterator.fileName;
                _data.createdAt = iterator.createdAt;
                _data.updatedAt = iterator.updatedAt;
                this.resData.push(_data);
            }
        }
    }
}

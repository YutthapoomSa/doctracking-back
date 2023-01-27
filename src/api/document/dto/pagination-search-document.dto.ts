import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import moment from 'moment';
import { DocumentDB, EnumDocTypeDocumentDB, EnumPriorityDocumentDB } from './../../../database/entity/document.entity';
import { UserDB } from './../../../database/entity/user.entity';
import { DocHistoryDBStatus } from './../../../database/enum/db-enum-global';
import { AppService } from './../../../helper/services/app.service';
import { ResStatus } from './../../../shared/enum/res-status.enum';

export class PaginationSearchDocumentDTO {
    @ApiProperty({
        example: '10',
    })
    @IsNotEmpty()
    @IsNumber()
    perPages: number;

    @ApiProperty({
        example: '1',
    })
    @IsNumber()
    @IsNotEmpty()
    page: number;

    @ApiProperty({
        example: '',
    })
    @IsString()
    search: string;

    @ApiProperty({
        example: moment().startOf('month').format('YYYY-MM-DD')
    })
    startAt: string;

    @ApiProperty({
        example: moment().endOf('month').format('YYYY-MM-DD')
    })
    endAt: string
}
class User {
    @ApiProperty()
    id: string;
    @ApiProperty()
    firstName: string;
    @ApiProperty()
    lastName: string;
    @ApiProperty()
    phoneNumber: string;
}
class PaginationSearchDocumentResDTODatas {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty({
        enum: Object.keys(EnumPriorityDocumentDB).map((k) => EnumPriorityDocumentDB[k]),
    })
    priority: string;

    @ApiProperty({
        enum: Object.keys(EnumDocTypeDocumentDB).map((k) => EnumDocTypeDocumentDB[k]),
    })
    documentType: string;

    @ApiProperty()
    detail: string;

    @ApiProperty()
    governmentDocNo: string;

    @ApiProperty()
    barcode: string;

    @ApiProperty()
    agencyId: string;

    @ApiProperty()
    userId: string;

    @ApiProperty({
        enum: Object.keys(DocHistoryDBStatus).map((k) => DocHistoryDBStatus[k]),
    })
    status: string;

    @ApiProperty()
    createdAt: string;

    @ApiProperty()
    updatedAt: string;

    @ApiProperty()
    agencySenderName: string;

    @ApiProperty()
    agencyRecipientName: string;

    @ApiProperty()
    docNo: string;

    @ApiProperty()
    formDoc: string;

    @ApiProperty()
    toDoc: string;

    @ApiProperty()
    externalDate: string;

    @ApiProperty()
    user: User;
}
class PaginationSearchDocumentResDTOData {
    @ApiProperty()
    totalItems: number;

    @ApiProperty()
    itemsPerPage: number;

    @ApiProperty()
    totalPages: number;

    @ApiProperty()
    currentPage: number;

    @ApiProperty({
        type: () => [PaginationSearchDocumentResDTODatas],
    })
    datas: PaginationSearchDocumentResDTODatas[];
}
export class PaginationSearchDocumentResDTO {
    @ApiProperty({
        enum: Object.keys(ResStatus).map((k) => ResStatus[k]),
        description: 'รหัสสถานะ',
    })
    resCode: ResStatus;

    @ApiProperty({
        type: () => PaginationSearchDocumentResDTOData,
        description: 'ข้อมูล',
    })
    resData: PaginationSearchDocumentResDTOData;

    @ApiProperty({
        description: 'ข้อความอธิบาย',
    })
    msg: string;

    constructor(
        resStatus: ResStatus,
        msg: string,
        data: DocumentDB[],
        totalItems: number,
        itemsPerPage: number,
        totalPages: number,
        currentPage: number,
        userDB: UserDB[],
    ) {
        this.resCode = resStatus;
        this.msg = msg;

        const findUser = (userId: string) => {
            let res: UserDB = null;
            if (!!userDB) {
                for (const iterator of userDB) {
                    if (iterator.id === userId) {
                        res = iterator;
                        break;
                    }
                }
            }
            return res;
        };
        const _resData = new PaginationSearchDocumentResDTOData();
        _resData.itemsPerPage = itemsPerPage;
        _resData.totalItems = totalItems;
        _resData.currentPage = currentPage;
        _resData.totalPages = totalPages;
        _resData.datas = [];

        const appService = new AppService();
        for (const item of data) {
            const _data = new PaginationSearchDocumentResDTODatas();
            // _data.id = item.id;
            // _data.name = item.name;
            // _data.agencyId = item.agencyId;
            // _data.barcode = item.barcode;
            // _data.createdAt = moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss');
            // _data.updatedAt = moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss');
            // _data.documentType = item.documentType;
            // _data.priority = item.priority;
            // _data.detail = item.detail;
            // _data.governmentDocNo = item.governmentDocNo;
            // _data.docNo = item.docNo;
            // _data.formDoc = item.formDoc;
            // _data.toDoc = item.toDoc;
            _data.name = item.name;
            _data.detail = item.detail;
            _data.documentType = appService.translateDocumentType(item.documentType);
            _data.governmentDocNo = item.governmentDocNo;
            _data.createdAt = moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss');
            _data.externalDate = item.externalDate;
            _data.user = null;
            if (item.userId) {
                const resultUser = findUser(item.userId);
                if (resultUser) {
                    _data.user = new User();
                    _data.user.id = resultUser.id;
                    _data.user.firstName = resultUser.firstName;
                    _data.user.lastName = resultUser.lastName;
                    _data.user.phoneNumber = resultUser.phoneNumber;
                }
            }
            _resData.datas.push(_data);
        }
        this.resData = _resData;
    }
}

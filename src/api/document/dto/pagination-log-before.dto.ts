import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import moment from 'moment';
import { DocumentExternalClerkDB } from './../../../database/entity/document-external-clerk.entity';
import { DocumentInternalClerkDB } from './../../../database/entity/document-internal-clerk.entity';
import { LogBeforeDB } from './../../../database/entity/log-before.entity';
import { UserDB } from './../../../database/entity/user.entity';
import { ResStatus } from './../../../shared/enum/res-status.enum';
export class PaginationLogBeforeDTO {
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

export class PaginationLogBeforeResDTOResDatas {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty({

    })
    priority: string;

    @ApiProperty({
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

    @ApiProperty()
    status: string;

    @ApiProperty()
    createdAt: string;

    @ApiProperty()
    updatedAt: string;

    @ApiProperty({
        type: () => User,
    })
    user: User;

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
    documentId: string;

    @ApiProperty()
    externalAgencyName: string;

    @ApiProperty()
    files: string[]
}
export class PaginationLogBeforeResDTOResData {
    @ApiProperty()
    totalItems: number;

    @ApiProperty()
    itemsPerPage: number;

    @ApiProperty()
    totalPages: number;

    @ApiProperty()
    currentPage: number;

    @ApiProperty({
        type: () => [PaginationLogBeforeResDTOResDatas],
    })
    datas: PaginationLogBeforeResDTOResDatas[];
}
export class PaginationLogBeforeResDTO {
    @ApiProperty({
        enum: Object.keys(ResStatus).map((k) => ResStatus[k]),
        description: 'รหัสสถานะ',
    })
    resCode: ResStatus;

    @ApiProperty({
        type: () => PaginationLogBeforeResDTOResData,
        description: 'ข้อมูล',
    })
    resData: PaginationLogBeforeResDTOResData;

    @ApiProperty({
        description: 'ข้อความอธิบาย',
    })
    msg: string;

    constructor(
        resStatus: ResStatus,
        msg: string,
        data: LogBeforeDB[],
        totalItems: number,
        itemsPerPage: number,
        totalPages: number,
        currentPage: number,
        userDB: UserDB[],
        allExternalClerk: DocumentExternalClerkDB[],
        allInternalClerk: DocumentInternalClerkDB[]
    ) {
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


        this.resCode = resStatus;
        this.msg = msg;

        const _resData = new PaginationLogBeforeResDTOResData();
        _resData.itemsPerPage = itemsPerPage;
        _resData.totalItems = totalItems;
        _resData.currentPage = currentPage;
        _resData.totalPages = totalPages;
        _resData.datas = [];

        for (const item of data) {
            const _data = new PaginationLogBeforeResDTOResDatas();
            _data.id = item.id;
            _data.name = item.name;
            _data.barcode = item.barcode;
            _data.createdAt = moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss');
            _data.updatedAt = moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss');
            _data.documentType = item.documentType;
            _data.priority = item.priority;
            _data.detail = item.detail;
            // _data.status = item.status;
            _data.governmentDocNo = item.governmentDocNo;
            _data.externalAgencyName = _data.externalAgencyName;
            // _data.docNo = item.docNo;
            if (!!allExternalClerk && allExternalClerk.length !== 0) {
                allExternalClerk.find((item2) => {
                    if (item2.documentId === item.documentId) {
                        _data.docNo = item2.docNo;
                    }
                })
            }
            if (!!allInternalClerk && allInternalClerk.length !== 0) {
                allInternalClerk.find((item2) => {
                    if (item2.documentId === item.documentId) {
                        _data.docNo = item2.docNo;
                    }
                })
            }
            _data.formDoc = item.formDoc;
            _data.toDoc = item.toDoc;
            _data.externalDate = item.externalDate;
            _data.files = JSON.parse(item.files)
            _data.documentId = item.documentId
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
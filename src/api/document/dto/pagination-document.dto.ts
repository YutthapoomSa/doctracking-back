import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import moment from 'moment';
import { AgencyDB } from './../../../database/entity/agency.entity';
import { DocumentDB, EnumDocTypeDocumentDB, EnumPriorityDocumentDB } from './../../../database/entity/document.entity';
import { UserDB } from './../../../database/entity/user.entity';
import { DocHistoryDBStatus } from './../../../database/enum/db-enum-global';
import { ResStatus } from './../../../shared/enum/res-status.enum';

export class DocumentPaginationDTO {
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
}
// ────────────────────────────────────────────────────────────────────────────────

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

class Agency {
    @ApiProperty()
    id: string;
    @ApiProperty()
    agencyName: string;
}
class DocumentPaginationResDTOResDatas {
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

    @ApiProperty({
        type: () => Agency,
    })
    agency: Agency;

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
}

class DocumentPaginationResDTOResData {
    @ApiProperty()
    totalItems: number;

    @ApiProperty()
    itemsPerPage: number;

    @ApiProperty()
    totalPages: number;

    @ApiProperty()
    currentPage: number;

    @ApiProperty({
        type: () => [DocumentPaginationResDTOResDatas],
    })
    datas: DocumentPaginationResDTOResDatas[];
}

export class DocumentPaginationResDTO {
    @ApiProperty({
        enum: Object.keys(ResStatus).map((k) => ResStatus[k]),
        description: 'รหัสสถานะ',
    })
    resCode: ResStatus;

    @ApiProperty({
        type: () => DocumentPaginationResDTOResData,
        description: 'ข้อมูล',
    })
    resData: DocumentPaginationResDTOResData;

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
        agencyDB: AgencyDB[],
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

        const findAgency = (agencyId: string) => {
            let res: AgencyDB = null;
            if (!!agencyDB) {
                for (const iterator of agencyDB) {
                    if (iterator.id === agencyId) {
                        res = iterator;
                        break;
                    }
                }
            }
            return res;
        };
        // ─────────────────────────────────────────────────────────────────

        this.resCode = resStatus;
        this.msg = msg;

        const _resData = new DocumentPaginationResDTOResData();
        _resData.itemsPerPage = itemsPerPage;
        _resData.totalItems = totalItems;
        _resData.currentPage = currentPage;
        _resData.totalPages = totalPages;
        _resData.datas = [];

        for (const item of data) {
            const _data = new DocumentPaginationResDTOResDatas();
            _data.id = item.id;
            _data.name = item.name;
            _data.agencyId = item.agencyId;
            _data.barcode = item.barcode;
            _data.createdAt = moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss');
            _data.updatedAt = moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss');
            _data.documentType = item.documentType;
            _data.priority = item.priority;
            _data.detail = item.detail;
            // _data.status = item.status;
            _data.governmentDocNo = item.governmentDocNo;
            _data.docNo = item.docNo;
            _data.formDoc = item.formDoc;
            _data.toDoc = item.toDoc;

            _data.agency = null;
            _data.user = null;

            if (item.agencyId) {
                const resultAgency = findAgency(item.agencyId);
                if (resultAgency) {
                    _data.agency = new Agency();
                    _data.agency.id = resultAgency.id;
                    _data.agency.agencyName = resultAgency.agencyName;
                }
            }

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

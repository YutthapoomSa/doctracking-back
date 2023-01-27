import { ApiProperty } from '@nestjs/swagger';
import { DocumentRoutingDB } from './../../../database/entity/document-routing.entity';
import { DocumentDB } from './../../../database/entity/document.entity';
import { AppService } from './../../../helper/services/app.service';
import { ConfigService } from './../../../shared/config/config.service';
import { ResStatus } from './../../../shared/enum/res-status.enum';

class AgencySecondarySender {
    @ApiProperty()
    id: string;
    @ApiProperty()
    agencyName: string;
    @ApiProperty()
    abbreviationName: string;
    @ApiProperty()
    agencyCode: string;
    @ApiProperty()
    agencyId: string;
}

class AgencySecondaryRecipient {
    @ApiProperty()
    id: string;
    @ApiProperty()
    agencyName: string;
    @ApiProperty()
    abbreviationName: string;
    @ApiProperty()
    agencyCode: string;
    @ApiProperty()
    agencyId: string;
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

class DocFileList {
    @ApiProperty()
    id: string;
    @ApiProperty()
    fileName: string;
    @ApiProperty()
    fileFullPath: string;
    @ApiProperty()
    fileSize: number;
    @ApiProperty()
    documentId: string;
    @ApiProperty()
    createdAt: string;
    @ApiProperty()
    updatedAt: string;
}

class Agency {
    @ApiProperty()
    id: string;
    @ApiProperty()
    agencyName: string;
    @ApiProperty()
    abbreviationName: string;
    @ApiProperty()
    agencyCode: string;
}
class DocHistoryList {
    @ApiProperty()
    id: string;
    @ApiProperty()
    status: string;
    @ApiProperty()
    comment: string;
    @ApiProperty()
    documentRoutingId: string;
    @ApiProperty()
    userId: string;
    @ApiProperty()
    createdAt: Date;
    @ApiProperty()
    updatedAt: Date;
    @ApiProperty({
        type: () => Agency,
    })
    agencySender: Agency;
    @ApiProperty({
        type: () => Agency,
    })
    agencyRecipient: Agency;

    @ApiProperty({
        type: () => User,
    })
    user: User;

    @ApiProperty({
        type: () => AgencySecondarySender,
    })
    agencySecondarySender: AgencySecondarySender;
    @ApiProperty({
        type: () => AgencySecondaryRecipient,
    })
    agencySecondaryRecipient: AgencySecondaryRecipient;

    @ApiProperty()
    abbreviationName: string;
}
class DocumentRoutingList {
    @ApiProperty()
    id: string;
    @ApiProperty()
    documentId: string;
    @ApiProperty()
    isSuccess: boolean;
    @ApiProperty()
    agencyIdSender: string;
    @ApiProperty()
    agencyIdRecipient: string;
    @ApiProperty()
    agencySecondaryIdSender: any;
    @ApiProperty()
    agencySecondaryIdRecipient: any;
    @ApiProperty()
    createdAt: string;
    @ApiProperty()
    updatedAt: string;
    @ApiProperty({ type: () => [DocHistoryList] })
    docHistoryLists: DocHistoryList[];
    @ApiProperty()
    status: string;

    @ApiProperty()
    isCollapse: boolean;

    @ApiProperty()
    agencyRecipientName: string;

    @ApiProperty()
    agencySecondaryRecipientName: string;

    @ApiProperty()
    agencySenderName: string;

    @ApiProperty()
    agencySecondarySenderName: string;
}
class DocumentApproveList {
    @ApiProperty()
    id: string;
    @ApiProperty()
    status: string;
    @ApiProperty({ type: () => Agency })
    agency: Agency;
    @ApiProperty({ type: () => User })
    user: User;
}
class ExternalDate {
    @ApiProperty()
    day: number;
    @ApiProperty()
    month: number;
    @ApiProperty()
    year: number;
}
class FineOneDocumentResDTOResData {
    @ApiProperty()
    id: string;

    @ApiProperty()
    status: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    detail: string;

    @ApiProperty()
    governmentDocNo: string;

    @ApiProperty()
    priority: string;

    @ApiProperty()
    barcode: string;

    @ApiProperty()
    documentType: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    agencyId: string;

    @ApiProperty()
    userId: string;

    @ApiProperty()
    updatedAt: Date;

    // @ApiProperty({
    //     type: () => [DocHistoryList],
    // })
    // docHistoryLists: DocHistoryList[];

    @ApiProperty({
        type: () => [DocumentRoutingList],
    })
    documentRoutingLists: DocumentRoutingList[];

    @ApiProperty({
        type: () => [DocumentApproveList],
    })
    documentApproveLists: DocumentApproveList[];

    @ApiProperty({
        type: () => [DocFileList],
    })
    docFileLists: DocFileList[];

    @ApiProperty()
    user: User;

    @ApiProperty()
    totalRouting: number;

    @ApiProperty()
    currentRouting: number;

    @ApiProperty()
    isDocumentDone: boolean;

    @ApiProperty()
    isCancel: boolean;

    @ApiProperty()
    isExternal: boolean;

    @ApiProperty()
    externalAgencyName: string;

    @ApiProperty(
        {
            type: () => ExternalDate
        }
    )
    externalDate: ExternalDate;
}

export class FindOneDocumentResDTO {
    @ApiProperty({
        enum: Object.keys(ResStatus).map((k) => ResStatus[k]),
        description: 'รหัสสถานะ',
    })
    resCode: ResStatus;

    @ApiProperty({
        description: 'ข้อความอธิบาย',
    })
    msg: string;

    @ApiProperty({
        type: () => FineOneDocumentResDTOResData,
        description: 'ข้อมูล',
    })
    resData: FineOneDocumentResDTOResData;

    constructor(resCode: ResStatus, msg: string, datas: DocumentDB) {
        this.resCode = resCode;
        this.msg = msg;
        this.resData = null;

        const config = new ConfigService();
        const appService = new AppService();
        const currentRouting = (routingId: string, documentRoutingLists: DocumentRoutingDB[]): number => {
            let count = 0;
            // console.log('jibSheetID ->>> ', jobSheetId);

            // for (const iterator of datas.documentRoutingLists) {
            //     if (iterator.id !== routingId) continue;

            //     if (iterator.isSuccess === true) {
            //         console.log('id -> ', iterator.id);
            //         console.log('routingId -> ', routingId);
            //         count += 1;
            //         console.log('count -> ', count);
            //     }
            //     break;
            // }
            count = documentRoutingLists.filter((res) => res.isSuccess === true).length;
            return count;
        };

        const totalRouting = (): number => {
            let count = 0;

            if (datas.documentRoutingLists.length > 0) {
                count = datas.documentRoutingLists.length;
            } else {
                count = 0;
            }

            return count;
        };
        if (!!datas) {
            const result = new FineOneDocumentResDTOResData();
            result.id = datas.id;
            // result.status = datas.status;
            result.name = datas.name;
            result.detail = datas.detail;
            result.governmentDocNo = datas.governmentDocNo;
            // result.priority = appService.translatePriority(datas.priority);
            result.priority = datas.priority;
            result.barcode = datas.barcode;
            // result.documentType = appService.translateDocumentType(datas.documentType);
            result.documentType = datas.documentType;
            result.createdAt = datas.createdAt;
            result.updatedAt = datas.updatedAt;
            result.userId = datas.userId;
            result.externalAgencyName = datas.externalAgencyName;
            result.isCancel = datas.isCancel;
            result.isExternal = datas.isExternal;
            const arrExternalDate = datas.externalDate.split('-');
            console.log('arrExternalDate -> ', arrExternalDate[0]);

            if (!!arrExternalDate[0] && !!arrExternalDate[1] && !!arrExternalDate[2]) {
                result.externalDate = {
                    year: Number(arrExternalDate[0]) ? Number(arrExternalDate[0]) : null,
                    month: Number(arrExternalDate[1]) ? Number(arrExternalDate[1]) : null,
                    day: Number(arrExternalDate[2]) ? Number(arrExternalDate[2]) : null
                }
                // result.externalDate.year = arrExternalDate[0] ? arrExternalDate[0] : '';
                // result.externalDate.month = arrExternalDate[1] ? arrExternalDate[1] : '';
                // result.externalDate.day = arrExternalDate[2] ? arrExternalDate[2] : '';
            } else {
                result.externalDate = {
                    year: null,
                    month: null,
                    day: null
                }
            }

            // result.currentRouting = 0;
            // result.totalRouting = 0;
            // result.docHistoryLists = [];
            result.documentRoutingLists = [];
            result.docFileLists = [];
            result.documentApproveLists = [];
            result.user = null;

            if (!!datas.documentApproveLists && datas.documentApproveLists.length > 0) {
                for (const iterator of datas.documentApproveLists) {
                    const documentApproveList = new DocumentApproveList();
                    documentApproveList.id = iterator.id;
                    documentApproveList.status = appService.translateApprove(iterator.status);
                    documentApproveList.user = null;
                    documentApproveList.agency = null;

                    if (iterator.user) {
                        const user = new User();
                        user.id = iterator.user.id;
                        user.firstName = iterator.user.firstName;
                        user.lastName = iterator.user.lastName;
                        user.phoneNumber = iterator.user.phoneNumber
                        documentApproveList.user = user;
                    }

                    if (iterator.agency) {
                        const agency = new Agency();
                        agency.id = iterator.agency.id;
                        agency.agencyName = iterator.agency.agencyName;
                        agency.abbreviationName = iterator.agency.abbreviationName;
                        agency.agencyCode = iterator.agency.agencyCode;
                        documentApproveList.agency = agency;
                    }
                }
            }

            if (!!datas.user) {
                const user = new User();
                user.id = datas.user.id;
                user.firstName = datas.user.firstName;
                user.lastName = datas.user.lastName;
                user.phoneNumber = datas.user.phoneNumber;
                result.user = user;
            }
            // if (datas.id === '94a16e99-1a1c-4d44-a149-08bb6272d1ef') {
            //     console.log('routing -> ', JSON.parse(JSON.stringify(datas.documentRoutingLists)));
            // }
            if (!!datas.documentRoutingLists && datas.documentRoutingLists.length > 0) {
                for (const item of datas.documentRoutingLists) {
                    const docRouting = new DocumentRoutingList();
                    docRouting.isSuccess = item.isSuccess;
                    docRouting.agencyIdRecipient = item.agencyIdRecipient;
                    docRouting.agencyIdSender = item.agencyIdSender;
                    docRouting.agencySecondaryIdRecipient = item.agencySecondaryIdRecipient;
                    docRouting.agencySecondaryIdSender = item.agencySecondaryIdSender;
                    docRouting.createdAt = item.createdAt;
                    docRouting.documentId = item.documentId;
                    docRouting.updatedAt = item.updatedAt;
                    docRouting.id = item.id;
                    docRouting.status = appService.translateStatusEnum(item.status);
                    result.currentRouting = currentRouting(item.id, datas.documentRoutingLists)
                        ? currentRouting(item.id, datas.documentRoutingLists)
                        : 0;
                    result.totalRouting = totalRouting() ? totalRouting() : 0;
                    if (
                        result.currentRouting === result.totalRouting &&
                        result.currentRouting !== 0 &&
                        result.totalRouting !== 0
                    ) {
                        result.isDocumentDone = true;
                    } else {
                        result.isDocumentDone = false;
                    }
                    docRouting.isCollapse = false;
                    if (!!item.agencyRecipient) {
                        docRouting.agencyRecipientName = item.agencyRecipient.agencyName;
                        const secondaryName = item.agencyRecipient.agencySecondaryLists.find((res) => {
                            if (res.id === item.agencySecondaryIdRecipient) {
                                docRouting.agencySecondaryRecipientName = res.agencyName;
                                return res;
                            } else {
                                docRouting.agencySecondaryRecipientName = '';
                                return '';
                            }
                        });
                    } else {
                        docRouting.agencyRecipientName = '';
                        docRouting.agencySecondaryRecipientName = '';
                    }
                    if (!!item.agencySender) {
                        docRouting.agencySenderName = item.agencySender.agencyName;
                        const secondaryName = item.agencySender.agencySecondaryLists.find((res) => {
                            if (res.id === item.agencySecondaryIdSender) {
                                docRouting.agencySecondarySenderName = res.agencyName;
                                return res;
                            } else {
                                docRouting.agencySecondarySenderName = '';
                                return '';
                            }
                        });
                    } else {
                        docRouting.agencySenderName = '';
                        docRouting.agencySecondarySenderName = '';
                    }
                    docRouting.isCollapse = false;
                    docRouting.docHistoryLists = [];

                    if (!!item.docHistoryLists) {
                        for (const item2 of item.docHistoryLists) {
                            const docHistoryList = new DocHistoryList();
                            docHistoryList.id = item2.id;
                            docHistoryList.status = appService.translateStatusEnum(item2.status);
                            docHistoryList.comment = item2.comment;
                            docHistoryList.documentRoutingId = item2.documentRoutingId;
                            docHistoryList.userId = item2.userId;
                            docHistoryList.createdAt = item2.createdAt;
                            docHistoryList.updatedAt = item2.updatedAt;
                            docHistoryList.agencySender = null;
                            docHistoryList.agencyRecipient = null;
                            docHistoryList.user = null;
                            docHistoryList.agencySecondaryRecipient = null;
                            docHistoryList.agencySecondarySender = null;
                            if (!!item2.agencySender) {
                                const agencyIdSender = new Agency();
                                agencyIdSender.id = item2.agencySender.id;
                                agencyIdSender.agencyName = item2.agencySender.agencyName;
                                agencyIdSender.abbreviationName = item2.agencySender.abbreviationName;
                                agencyIdSender.agencyCode = item2.agencySender.agencyCode;
                                docHistoryList.agencySender = agencyIdSender;
                            }

                            if (!!item2.agencyRecipient) {
                                const agencyRecipient = new Agency();
                                agencyRecipient.id = item2.agencyRecipient.id;
                                agencyRecipient.agencyName = item2.agencyRecipient.agencyName;
                                agencyRecipient.abbreviationName = item2.agencyRecipient.abbreviationName;
                                agencyRecipient.agencyCode = item2.agencyRecipient.agencyCode;
                                docHistoryList.agencyRecipient = agencyRecipient;
                            }

                            if (!!item2.user) {
                                const user = new User();
                                user.id = item2.user.id;
                                user.firstName = item2.user.firstName;
                                user.lastName = item2.user.lastName;
                                docHistoryList.user = user;
                                if (!!item2.user.userAgencyLists) {
                                    item2.user.userAgencyLists.find((res1) => {
                                        // console.log('res1 -> ', JSON.parse(JSON.stringify(res1)));

                                        res1.agency.agencySecondaryLists.find((res2) => {
                                            if (res2.id === res1.agencySecondaryId) {
                                                // console.log('res2 -> ', res2.agencyName);
                                                docHistoryList.abbreviationName = res2.abbreviationName;
                                            } else if (res2.agencyId === res1.agencyId) {
                                                docHistoryList.abbreviationName = res1.agency.abbreviationName;
                                            }
                                            // console.log('res2 -> ', JSON.parse(JSON.stringify(res2)));
                                        });
                                    });
                                    // if (!!item2.user.userAgencyLists[0].agency.agencySecondaryLists) {
                                    //     item2.user.userAgencyLists[0].agency.agencySecondaryLists.find((res) => {
                                    //         if (res.agencyId === item2.user.userAgencyLists[0].agency.id) {
                                    //             docHistoryList.abbreviationName = res.abbreviationName;
                                    //             // console.log('res.abbreviationName -> ', res.abbreviationName);
                                    //         }
                                    //     });
                                    // } else {
                                    //     docHistoryList.abbreviationName =
                                    //         item2.user.userAgencyLists[0].agency.abbreviationName;
                                    // }
                                }
                            }

                            if (!!item2.agencySecondaryRecipient) {
                                const agencySecondaryRecipient = new AgencySecondaryRecipient();
                                agencySecondaryRecipient.abbreviationName =
                                    item2.agencySecondaryRecipient.abbreviationName;
                                agencySecondaryRecipient.agencyCode = item2.agencySecondaryRecipient.agencyCode;
                                agencySecondaryRecipient.agencyId = item2.agencySecondaryRecipient.agencyId;
                                agencySecondaryRecipient.id = item2.agencySecondaryRecipient.id;
                                docHistoryList.agencySecondaryRecipient = agencySecondaryRecipient;
                            }
                            if (!!item2.agencySecondarySender) {
                                const agencySecondarySender = new AgencySecondarySender();
                                agencySecondarySender.abbreviationName = item2.agencySecondarySender.abbreviationName;
                                agencySecondarySender.agencyCode = item2.agencySecondarySender.agencyCode;
                                agencySecondarySender.agencyId = item2.agencySecondarySender.agencyId;
                                agencySecondarySender.id = item2.agencySecondarySender.id;
                                docHistoryList.agencySecondarySender = agencySecondarySender;
                            }
                            docRouting.docHistoryLists.push(docHistoryList);
                        }
                    }
                    result.documentRoutingLists.push(docRouting);
                    result.documentRoutingLists[0].isCollapse = true;
                }
            }

            // if (!!datas.docHistoryLists && datas.docHistoryLists.length > 0) {
            //     for (const iterator of datas.docHistoryLists) {
            //         const docHistoryList = new DocHistoryList();
            //         docHistoryList.id = iterator.id;
            //         docHistoryList.status = iterator.status;
            //         docHistoryList.comment = iterator.comment;
            //         docHistoryList.documentId = iterator.documentId;
            //         docHistoryList.userId = iterator.userId;
            //         docHistoryList.createdAt = iterator.createdAt;
            //         docHistoryList.updatedAt = iterator.updatedAt;
            //         docHistoryList.agencySender = null;
            //         docHistoryList.agencyRecipient = null;
            //         docHistoryList.user = null;

            //         if (!!iterator.agencySender) {
            //             const agencyIdSender = new Agency();
            //             agencyIdSender.id = iterator.agencySender.id;
            //             agencyIdSender.agencyName = iterator.agencySender.agencyName;
            //             agencyIdSender.abbreviationName = iterator.agencySender.abbreviationName;
            //             agencyIdSender.agencyCode = iterator.agencySender.agencyCode;
            //             docHistoryList.agencySender = agencyIdSender;
            //         }

            //         if (!!iterator.agencyRecipient) {
            //             const agencyRecipient = new Agency();
            //             agencyRecipient.id = iterator.agencyRecipient.id;
            //             agencyRecipient.agencyName = iterator.agencyRecipient.agencyName;
            //             agencyRecipient.abbreviationName = iterator.agencyRecipient.abbreviationName;
            //             agencyRecipient.agencyCode = iterator.agencyRecipient.agencyCode;
            //             docHistoryList.agencyRecipient = agencyRecipient;
            //         }

            //         if (!!iterator.user) {
            //             const user = new User();
            //             user.id = iterator.user.id;
            //             user.firstName = iterator.user.firstName;
            //             user.lastName = iterator.user.lastName;
            //             docHistoryList.user = user;
            //         }

            //         result.docHistoryLists.push(docHistoryList);
            //     }
            // }

            if (!!datas.docFileLists && datas.docFileLists.length > 0) {
                for (const iterator of datas.docFileLists) {
                    const docFileList = new DocFileList();
                    docFileList.id = iterator.id;
                    docFileList.fileFullPath = `${config.getImagePath.docPath}/${iterator.fileName}`;
                    docFileList.fileName = iterator.fileName;
                    docFileList.fileSize = iterator.fileSize;
                    docFileList.documentId = iterator.documentId;
                    docFileList.createdAt = iterator.createdAt;
                    docFileList.updatedAt = iterator.updatedAt;
                    result.docFileLists.push(docFileList);
                }
            }
            this.resData = result;
        }
    }
}

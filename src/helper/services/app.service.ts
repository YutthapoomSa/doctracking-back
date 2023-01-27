import { Injectable } from '@nestjs/common';
import {
    EnumDocApproveDocumentDB,
    EnumDocTypeDocumentDB,
    EnumPriorityDocumentDB,
} from './../../database/entity/document.entity';
import { DocHistoryDBStatus } from './../../database/enum/db-enum-global';

@Injectable()
export class AppService {
    distance(lat1: number, lon1: number, lat2: number, lon2: number) {
        if (lat1 === lat2 && lon1 === lon2) return 0;
        const radLat1 = (Math.PI * lat1) / 180;
        const radLat2 = (Math.PI * lat2) / 180;
        const theta = lon1 - lon2;
        const radTheta = (Math.PI * theta) / 180;
        let dist = Math.sin(radLat1) * Math.sin(radLat2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radTheta);
        if (dist > 1) dist = 1;
        dist = Math.acos(dist);
        dist = (dist * 180) / Math.PI;
        dist = dist * 60 * 1.1515;
        dist = dist * 1.609344;
        return dist;
    }

    translateStatusEnum(status: string) {
        // success = 'success',
        // unsuccessful = 'unsuccessful',
        // processing = 'processing',
        // receive = 'receive',
        // sendOut = 'sendOut',
        // reject = 'reject',
        // create = 'create',
        // noEvent = 'noEvent',
        switch (status) {
            case DocHistoryDBStatus.success:
                return 'สำเร็จ';
            case DocHistoryDBStatus.unsuccessful:
                return 'ไม่สำเร็จ';
            case DocHistoryDBStatus.processing:
                return 'กำลังดำเนินการ';
            case DocHistoryDBStatus.receive:
                return 'รับเอกสาร';
            case DocHistoryDBStatus.sendOut:
                return 'ส่งออกเอกสาร';
            case DocHistoryDBStatus.reject:
                return 'เอกสารถูกปฏิเสธ';
            case DocHistoryDBStatus.create:
                return 'สร้างเอกสาร';
            case DocHistoryDBStatus.noEvent:
                return 'ไม่มีอีเว้นท์';
            default:
                return;
        }
    }
    translateDocumentType(status: string) {
        // internal = 'internal',
        // external = 'external',
        switch (status) {
            case EnumDocTypeDocumentDB.internal:
                return 'เอกสารภายใน';
            case EnumDocTypeDocumentDB.external:
                return 'เอกสารภายนอก';
            default:
                return;
        }
    }

    translatePriority(status: string) {
        // normal = 'normal',
        // urgent = 'urgent',
        // very_urgent = 'very_urgent',
        // the_most_urgent = 'the_most_urgent',
        switch (status) {
            case EnumPriorityDocumentDB.normal:
                return 'เอกสารปกติ';
            case EnumPriorityDocumentDB.urgent:
                return 'ด่วน';
            case EnumPriorityDocumentDB.very_urgent:
                return 'เร่งด่วนมาก';
            case EnumPriorityDocumentDB.the_most_urgent:
                return 'ด่วนที่สุด';
            default:
                return;
        }
    }

    translateApprove(status: string) {
        // approve = 'approve',
        // disapproved = 'disapproved',
        switch (status) {
            case EnumDocApproveDocumentDB.approve:
                return 'ต้องอนุมัติ';
            case EnumDocApproveDocumentDB.disapproved:
                return 'ไม่ต้องอนุมัติ';
            default:
                return;
        }
    }
}

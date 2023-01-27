import { ApiProperty } from '@nestjs/swagger';
import {
    BelongsTo,
    Column,
    CreatedAt,
    DataType,
    ForeignKey,
    HasMany,
    Model,
    Table,
    UpdatedAt
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { UserDB } from './../../database/entity/user.entity';
import { AgencyDB } from './agency.entity';
import { DocFileDB } from './doc-file.entity';
import { DocumentApproveDB } from './document-approve.entity';
import { DocumentExternalClerkDB } from './document-external-clerk.entity';
import { DocumentInternalClerkDB } from './document-internal-clerk.entity';
import { DocumentRoutingDB } from './document-routing.entity';
import { LogBeforeDB } from './log-before.entity';

export enum EnumDocTypeDocumentDB {
    internal = 'internal',
    external = 'external',
}

export enum EnumDocApproveDocumentDB {
    approve = 'approve',
    disapproved = 'disapproved',
}

export enum EnumPriorityDocumentDB {
    normal = 'normal',
    urgent = 'urgent',
    very_urgent = 'very_urgent',
    the_most_urgent = 'the_most_urgent',
}

@Table({
    tableName: 'document',
    comment: 'เอกสาร',
})
export class DocumentDB extends Model<DocumentDB> {
    @Column({
        type: DataType.UUID,
        allowNull: false,
        unique: 'unique_document_id',
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id: string;

    @ApiProperty()
    @Column({
        allowNull: false,
        comment: 'ชื่อเอกสาร',
    })
    name: string;

    @ApiProperty()
    @Column({
        allowNull: true,
        comment: 'รายละเอียด',
        defaultValue: null,
    })
    detail: string;

    @ApiProperty()
    @Column({
        allowNull: true,
        comment: 'หมายเลขรหัสหนังสือราชการ',
        defaultValue: null,
    })
    governmentDocNo: string;

    @ApiProperty()
    @Column({
        allowNull: true,
        comment: 'หมายเลขรหัสหนังสือราชการภายใน',
        defaultValue: null,
        unique: 'doc_no',
    })
    docNo: string;

    @ApiProperty()
    @Column({
        allowNull: true,
        comment: 'จากใคร',
        defaultValue: null,
        unique: 'form_doc',
    })
    formDoc: string;

    @ApiProperty()
    @Column({
        allowNull: true,
        comment: 'ถึงใคร',
        defaultValue: null,
        unique: 'to_doc',
    })
    toDoc: string;

    @ApiProperty()
    @Column({
        allowNull: true,
        type: DataType.ENUM({
            values: Object.keys(EnumPriorityDocumentDB).map((k) => EnumPriorityDocumentDB[k]),
        }),
        comment: 'ความสำคัญของเอกสาร',
        defaultValue: EnumPriorityDocumentDB.normal,
    })
    priority: EnumPriorityDocumentDB;

    @ApiProperty()
    @Column({
        allowNull: false,
        unique: 'barcode_no',
    })
    barcode: string;

    @ApiProperty()
    @Column({
        allowNull: false,
        type: DataType.ENUM({
            values: Object.keys(EnumDocTypeDocumentDB).map((k) => EnumDocTypeDocumentDB[k]),
        }),
        comment: 'ประเภทเอกสาร',
        defaultValue: EnumDocTypeDocumentDB.internal,
    })
    documentType: EnumDocTypeDocumentDB;

    @ApiProperty()
    @Column({
        allowNull: true,
        comment: 'วันเดือนปี ในเอกสาร ',
        defaultValue: null,
    })
    readonly recipientAt: string;

    @ApiProperty()
    @Column({
        allowNull: true,
        defaultValue: null,
    })
    isCancel: boolean;

    @ApiProperty()
    @Column({
        allowNull: true,
        defaultValue: null,
    })
    isExternal: boolean;

    @ApiProperty()
    @Column({
        allowNull: true,
        defaultValue: null,
    })
    externalAgencyName: string;

    @ApiProperty()
    @Column({
        allowNull: true,
        defaultValue: null,
    })
    externalDate: string;

    @CreatedAt
    @Column({})
    readonly createdAt?: Date;

    @UpdatedAt
    readonly updatedAt?: Date;

    // ────────────────────────────────────────────────────────────────────────────────

    @HasMany(() => DocFileDB)
    docFileLists: DocFileDB[];

    // ────────────────────────────────────────────────────────────────────────────────

    @HasMany(() => LogBeforeDB)
    logBeforeLists: LogBeforeDB[];

    // ────────────────────────────────────────────────────────────────────────────────

    @ForeignKey(() => AgencyDB)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    agencyId: string;

    @BelongsTo(() => AgencyDB)
    agency: AgencyDB;

    @ForeignKey(() => UserDB)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    userId: string;

    @BelongsTo(() => UserDB)
    user: UserDB;

    @HasMany(() => DocumentApproveDB)
    documentApproveLists: DocumentApproveDB[];

    @HasMany(() => DocumentRoutingDB)
    documentRoutingLists: DocumentRoutingDB[];

    @HasMany(() => DocumentInternalClerkDB)
    documentInternalClerkLists: DocumentInternalClerkDB[];

    @HasMany(() => DocumentExternalClerkDB)
    documentExternalClerkLists: DocumentExternalClerkDB[];
}

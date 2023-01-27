import { DocumentDB } from './document.entity';
import { ApiProperty } from '@nestjs/swagger';
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { AgencyDB } from './agency.entity';
import { UserDB } from './user.entity';

export enum EnumDocumentApproveDB {
    approve = 'approve',
    disapproved = 'disapproved',
    pending = 'pending',
}

@Table({
    tableName: 'document_approve',
    comment: 'เอกสาร',
})
export class DocumentApproveDB extends Model<DocumentApproveDB> {
    @Column({
        type: DataType.UUID,
        allowNull: false,
        unique: 'uq_doc_approve_id',
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id: string;

    @ApiProperty()
    @Column({
        allowNull: false,
        type: DataType.ENUM({
            values: Object.keys(EnumDocumentApproveDB).map((k) => EnumDocumentApproveDB[k]),
        }),
        comment: 'สถานะการอนุมัติ',
        defaultValue: EnumDocumentApproveDB.pending,
    })
    status: EnumDocumentApproveDB;

    // ────────────────────────────────────────────────────────────────────────────────

    @ForeignKey(() => AgencyDB)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        comment: 'หน่วยงานไหนจะต้องพิจารณา',
    })
    agencyId: string;

    @BelongsTo(() => AgencyDB)
    agency: AgencyDB;

    @ForeignKey(() => UserDB)
    @Column({
        type: DataType.UUID,
        allowNull: true,
        comment: 'ใครเป็นคนอนุมัติ',
        defaultValue: null,
    })
    userId: string;

    @BelongsTo(() => UserDB)
    user: UserDB;

    @ForeignKey(() => DocumentDB)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    documentId: string;

    @BelongsTo(() => DocumentDB)
    document: DocumentDB;
}

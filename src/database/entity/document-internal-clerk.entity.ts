import { ApiProperty } from '@nestjs/swagger';
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { DocumentExternalClerkDB } from './document-external-clerk.entity';
import { DocumentDB } from './document.entity';
@Table({
    tableName: 'document_internal_clerk',
    comment: 'ธุรการภายใน',
})
export class DocumentInternalClerkDB extends Model<DocumentInternalClerkDB> {
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
        allowNull: true,
        comment: 'หมายเลขรหัสหนังสือราชการภายใน',
        defaultValue: null,
        unique: 'doc_no',
    })
    docNo: string;

    @ApiProperty()
    @Column({
        allowNull: true,
        comment: '',
        defaultValue: false,
    })
    isStatusDone: boolean

    // ─────────────────────────────────────────────────────────────────────

    @ForeignKey(() => DocumentExternalClerkDB)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    documentExternalClerkId: string;

    @BelongsTo(() => DocumentExternalClerkDB)
    documentExternalClerk: DocumentExternalClerkDB;
    // ─────────────────────────────────────────────────────────────────────

    @ForeignKey(() => DocumentDB)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    documentId: string;

    @BelongsTo(() => DocumentDB)
    document: DocumentDB;

    // @HasMany(() => DocumentExternalClerkDB)
    // documentExternalClerkLists: DocumentExternalClerkDB[];
}

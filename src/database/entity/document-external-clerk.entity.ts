import { ApiProperty } from '@nestjs/swagger';
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { DocumentInternalClerkDB } from './document-internal-clerk.entity';
import { DocumentDB } from './document.entity';
@Table({
    tableName: 'document_external_clerk',
    comment: 'ธุรการภายนอก',
})
export class DocumentExternalClerkDB extends Model<DocumentExternalClerkDB> {
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
    isStatusDone: boolean;

    // ─────────────────────────────────────────────────────────────────────

    @ForeignKey(() => DocumentDB)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    documentId: string;

    @BelongsTo(() => DocumentDB)
    document: DocumentDB;

    // ─────────────────────────────────────────────────────────────────────

    @ForeignKey(() => DocumentInternalClerkDB)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    documentInternalClerkId: string;

    @BelongsTo(() => DocumentInternalClerkDB)
    documentInternalClerk: DocumentInternalClerkDB;

    // ─────────────────────────────────────────────────────────────────────

    // @HasMany(() => DocumentInternalClerkDB)
    // documentInternalClerkLists: DocumentInternalClerkDB[];
}

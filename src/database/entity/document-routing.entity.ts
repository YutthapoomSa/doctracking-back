import { ApiProperty } from '@nestjs/swagger';
import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { DocHistoryDBStatus } from './../enum/db-enum-global';
import { AgencySecondaryDB } from './agency-secondary.entity';
import { AgencyDB } from './agency.entity';
import { DocHistoryDB } from './doc-history.entity';
import { DocumentDB } from './document.entity';

@Table({
    tableName: 'document_routing',
    comment: 'เอกสาร ต้นทาง - ปลายทาง',
})
export class DocumentRoutingDB extends Model<DocumentRoutingDB> {
    @Column({
        type: DataType.UUID,
        allowNull: false,
        unique: 'unique_document_routing_id',
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id: string;

    @Column({
        type: DataType.UUID,
        defaultValue: () => uuidv4(),
        allowNull: true,
        comment: 'รหัสเส้นทาง',
    })
    routingTrackNumber: string;

    @Column({
        defaultValue: false,
        comment: 'สถานะการสำเร็จงาน',
    })
    isSuccess: boolean;

    @ApiProperty()
    @Column({
        allowNull: false,
        type: DataType.ENUM({
            values: Object.keys(DocHistoryDBStatus).map((k) => DocHistoryDBStatus[k]),
        }),
        comment: 'สถานะเอกสาร',
        defaultValue: DocHistoryDBStatus.create,
    })
    status: DocHistoryDBStatus;
    // ─────────────────────────────────────────────────────────────────────────────

    @ForeignKey(() => DocumentDB)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    documentId: string;

    @BelongsTo(() => DocumentDB)
    document: DocumentDB;

    // ─────────────────────────────────────────────────────────────────────────────

    @ForeignKey(() => AgencyDB)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    agencyIdSender: string;

    @BelongsTo(() => AgencyDB, {
        foreignKey: 'agencyIdSender',
    })
    agencySender: AgencyDB;

    // ─────────────────────────────────────────────────────────────────────────────

    @ForeignKey(() => AgencyDB)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    agencyIdRecipient: string;

    @BelongsTo(() => AgencyDB, {
        foreignKey: 'agencyIdRecipient',
    })
    agencyRecipient: AgencyDB;

    // ─────────────────────────────────────────────────────────────────────────────
    @HasMany(() => DocHistoryDB, {
        onDelete: 'CASCADE',
        hooks: true,
    })
    docHistoryLists: DocHistoryDB[];
    // ─────────────────────────────────────────────────────────────────────────────

    // ─────────────────────────────────────────────────────────────────────────────
    @ForeignKey(() => AgencySecondaryDB)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    agencySecondaryIdSender: string;

    @BelongsTo(() => AgencySecondaryDB, {
        foreignKey: 'agencySecondaryIdSender',
    })
    readonly agencySecondarySender: AgencySecondaryDB;

    // ─────────────────────────────────────────────────────────────────────────────

    @ForeignKey(() => AgencySecondaryDB)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    agencySecondaryIdRecipient: string;

    @BelongsTo(() => AgencySecondaryDB, {
        foreignKey: 'agencySecondaryIdRecipient',
    })
    readonly agencySecondaryRecipient: AgencySecondaryDB;

    // ─────────────────────────────────────────────────────────────────────────────
}

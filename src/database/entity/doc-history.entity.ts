import { ApiProperty } from '@nestjs/swagger';
import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { DocHistoryDBStatus } from '../enum/db-enum-global';
import { AgencyDB } from './../../database/entity/agency.entity';
import { UserDB } from './../../database/entity/user.entity';
import { AgencySecondaryDB } from './agency-secondary.entity';
import { DocumentRoutingDB } from './document-routing.entity';

@Table({
    tableName: 'doc_history',
    comment: 'ประวัติเอกสาร',
})
export class DocHistoryDB extends Model<DocHistoryDB> {
    @Column({
        type: DataType.UUID,
        allowNull: false,
        unique: 'unique_docHistory_id',
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id: string;

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

    @ApiProperty()
    @Column({
        allowNull: true,
        comment: 'รายละเอียดเพิ่มเติม',
        defaultValue: null,
    })
    comment: string;

    @ApiProperty()
    @Column({
        allowNull: false,
        comment: 'รับเอกสารมารับเข้าและรับต้นฉบับกลับคืน',
        defaultValue: false,
    })
    isAcceptAndReturn: boolean;

    @CreatedAt
    @Column({})
    readonly createdAt?: Date;

    @UpdatedAt
    @Column({})
    readonly updatedAt?: Date;
    // ────────────────────────────────────────────────────────────────────────────────
    @ForeignKey(() => DocumentRoutingDB)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    documentRoutingId: string;

    @BelongsTo(() => DocumentRoutingDB)
    documentRouting: DocumentRoutingDB;

    // ─────────────────────────────────────────────────────────────────────────────

    @ForeignKey(() => UserDB)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    userId: string;

    @BelongsTo(() => UserDB)
    user: UserDB;

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
    @ForeignKey(() => AgencySecondaryDB)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    agencySecondaryIdSender: string;

    @BelongsTo(() => AgencySecondaryDB, {
        foreignKey: 'agencySecondaryIdSender',
    })
    agencySecondarySender: AgencySecondaryDB;

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
    agencySecondaryRecipient: AgencySecondaryDB;

    // ─────────────────────────────────────────────────────────────────────────────
}

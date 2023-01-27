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
    UpdatedAt,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { AgencyDB } from './agency.entity';
import { DocHistoryDB } from './doc-history.entity';
import { DocumentRoutingDB } from './document-routing.entity';

@Table({
    tableName: 'agency_secondary',
    comment: 'หน่วยงาน ย่อ ลำดับที่ 2',
    indexes: [
        {
            unique: true,
            fields: ['agencyName', 'agencyCode'],
        },
    ],
})

// ─────────────────────────────────────────────────────────────────────
export class AgencySecondaryDB extends Model<AgencySecondaryDB> {
    @Column({
        type: DataType.UUID,
        allowNull: false,
        unique: 'unique_agency_sec_id',
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id: string;

    @ApiProperty()
    @Column({
        allowNull: false,
        comment: 'ชื่อหน่วยงาน',
        unique: 'unique_agency_sec_name',
    })
    agencyName: string;

    @ApiProperty()
    @Column({
        allowNull: true,
        comment: 'ชื่อย่อ',
        defaultValue: null,
    })
    abbreviationName: string;

    @ApiProperty()
    @Column({
        allowNull: true,
        comment: 'รหัสหน่วยงาน',
        defaultValue: null,
    })
    agencyCode: string;

    @CreatedAt
    readonly createdAt?: Date;

    @UpdatedAt
    readonly updatedAt?: Date;

    // ─────────────────────────────────────────────────────────────────────────────

    @ForeignKey(() => AgencyDB)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    agencyId: string;

    @BelongsTo(() => AgencyDB)
    agency: AgencyDB;

    // ─────────────────────────────────────────────────────────────────────────────

    @HasMany(() => DocHistoryDB, {
        foreignKey: 'agencySecondaryIdSender',
        as: 'agencySecondarySender',
    })
    docHistorySenderList: DocHistoryDB[];

    @HasMany(() => DocHistoryDB, {
        foreignKey: 'agencySecondaryIdRecipient',
        as: 'agencySecondaryRecipient',
    })
    docHistoryRecipientList: DocHistoryDB[];

    // ─────────────────────────────────────────────────────────────────────────────

    @HasMany(() => DocumentRoutingDB, {
        foreignKey: 'agencySecondaryIdSender',
        as: 'agencySecondarySenderRouting',
    })
    docRoutingSenderList: DocumentRoutingDB[];

    @HasMany(() => DocumentRoutingDB, {
        foreignKey: 'agencySecondaryIdRecipient',
        as: 'agencySecondaryRecipientRouting',
    })
    docRoutingRecipientList: DocumentRoutingDB[];
}

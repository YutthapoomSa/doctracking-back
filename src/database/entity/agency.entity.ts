import { AgencySecondaryDB } from './agency-secondary.entity';
import { DocumentApproveDB } from './document-approve.entity';
import { ApiProperty } from '@nestjs/swagger';
import { BelongsToMany, Column, CreatedAt, DataType, HasMany, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { DocHistoryDB } from './doc-history.entity';
import { DocumentDB } from './document.entity';
import { UserAgencyDB } from './user-agency.entity';
import { UserDB } from './user.entity';
import { DocumentRoutingDB } from './document-routing.entity';

@Table({
    tableName: 'agency',
    comment: 'หน่วยงาน',
    indexes: [
        {
            unique: true,
            fields: ['agencyName', 'agencyCode'],
        },
    ],
})

// ─────────────────────────────────────────────────────────────────────
export class AgencyDB extends Model<AgencyDB> {
    @Column({
        type: DataType.UUID,
        allowNull: false,
        unique: 'unique_agency_id',
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id: string;

    @ApiProperty()
    @Column({
        allowNull: false,
        comment: 'ชื่อหน่วยงาน',
        unique: 'unique_agencyName',
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

    // ─────────────────────────────────────────────────────────────────

    @HasMany(() => DocumentDB)
    documentLists: DocumentDB[];

    @HasMany(() => DocHistoryDB, {
        foreignKey: 'agencyIdSender',
        as: 'agencySender',
    })
    docHistorySenderList: DocHistoryDB[];

    @HasMany(() => DocHistoryDB, {
        foreignKey: 'agencyIdRecipient',
        as: 'agencyRecipient',
    })
    docHistoryRecipientList: DocHistoryDB[];

    // ────────────────────────────────────────────────────────────────────────────────

    @HasMany(() => DocumentRoutingDB, {
        foreignKey: 'agencyIdSender',
        as: 'documentRoutingAgencySender',
    })
    documentRoutingSenderList: DocumentRoutingDB[];

    @HasMany(() => DocumentRoutingDB, {
        foreignKey: 'agencyIdRecipient',
        as: 'documentRoutingAgencyRecipient',
    })
    documentRoutingRecipientList: DocumentRoutingDB[];

    // ────────────────────────────────────────────────────────────────────────────────
    // manyToMany

    @HasMany(() => UserAgencyDB)
    userAgencyList: UserAgencyDB[];

    @HasMany(() => UserAgencyDB)
    userAgencyLists: UserAgencyDB[];

    @HasMany(() => AgencySecondaryDB)
    agencySecondaryLists: AgencySecondaryDB[];

    @HasMany(() => DocumentApproveDB)
    documentApproveLists: DocumentApproveDB[];
}

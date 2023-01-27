import { AgencySecondaryDB } from './agency-secondary.entity';
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { AgencyDB } from './agency.entity';
import { UserDB } from './user.entity';
@Table({
    tableName: 'user_agency',
})
export class UserAgencyDB extends Model<UserAgencyDB> {
    @Column({
        type: DataType.UUID,
        allowNull: false,
        unique: 'unique_userAgency_id',
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id: string;

    // ────────────────────────────────────────────────────────────────────────────────

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
        defaultValue: null,
    })
    agencyId: string;

    @BelongsTo(() => AgencyDB)
    agency: AgencyDB;
    // ────────────────────────────────────────────────────────────────────────────────

    @ForeignKey(() => AgencySecondaryDB)
    @Column({
        type: DataType.UUID,
        allowNull: true,
        defaultValue: null,
    })
    agencySecondaryId: string;

    @BelongsTo(() => AgencySecondaryDB)
    agencySecondary: AgencySecondaryDB;
    // ────────────────────────────────────────────────────────────────────────────────
}

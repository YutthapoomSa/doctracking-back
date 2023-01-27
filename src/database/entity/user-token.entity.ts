import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { UserDB } from './user.entity';
import { v4 as uuidv4 } from 'uuid';
@Table({
    tableName: 'user_token',
})
export class UserTokenDB extends Model<UserTokenDB> {
    @Column({
        type: DataType.UUID,
        allowNull: false,
        unique: 'unique_user_token',
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id: string;

    @Column
    accessToken: string;

    @Column
    refreshToken: string;

    @Column({
        comment: 'วันหมดอายุ Token',
    })
    expire: string;

    // ────────────────────────────────────────────────────────────────────────────────

    @ForeignKey(() => UserDB)
    @Column({
        allowNull: true,
        type: DataType.UUID,
    })
    userId: string;

    @BelongsTo(() => UserDB)
    user: UserDB;
}

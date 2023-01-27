import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { UserDB } from './user.entity';
import { v4 as uuidv4 } from 'uuid';
@Table({
    tableName: 'user_socket',
})
export class UserSocketDB extends Model<UserSocketDB> {
    @Column({
        type: DataType.UUID,
        allowNull: false,
        unique: 'unique_user_socket',
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id: number;

    @Column
    refreshToken: string;

    @CreatedAt
    readonly createdAt?: Date;

    @UpdatedAt
    readonly updatedAt?: Date;
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

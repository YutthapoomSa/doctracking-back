import { IsHash } from 'class-validator';
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { UserDB } from './user.entity';
import { v4 as uuidv4 } from 'uuid';
@Table({
    tableName: 'user_password',
})
export class UserPasswordDB extends Model<UserPasswordDB> {
    @Column({
        type: DataType.UUID,
        allowNull: false,
        unique: 'uq_user_pass_id',
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id: string;

    @Column({
        allowNull: false,
        comment: 'password hash',
    })
    @IsHash('sha512')
    hashPassword: string;

    @Column({
        allowNull: false,
        defaultValue: false,
    })
    isResetProgress: boolean;

    @Column({
        allowNull: true,
        defaultValue: null,
    })
    resetCode: string;

    @Column({
        type: DataType.DATE,
        allowNull: true,
        defaultValue: null,
    })
    resetExpires: Date;

    @Column({
        allowNull: false,
        defaultValue: false,
    })
    activate: boolean;

    // ────────────────────────────────────────────────────────────────────────────────

    @ForeignKey(() => UserDB)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    userId: string;

    @BelongsTo(() => UserDB)
    user: UserDB;
}

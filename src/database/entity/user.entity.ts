import { ApiProperty } from '@nestjs/swagger';
import { Column, CreatedAt, DataType, HasMany, IsEmail, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { DocHistoryDB } from './doc-history.entity';
import { DocumentApproveDB } from './document-approve.entity';
import { DocumentDB } from './document.entity';
import { LogBeforeDB } from './log-before.entity';
import { UserAgencyDB } from './user-agency.entity';
import { UserPasswordDB } from './user-password.entity';
import { UserSocketDB } from './user-socket.entity';

export enum UserDBRole {
    superAdmin = 'superAdmin',
    manager = 'manager',
    admin = 'admin',
    user = 'user',
}

export enum UserDBGender {
    male = 'male',
    female = 'female',
    other = 'other',
}

@Table({
    tableName: 'user',
})
export class UserDB extends Model<UserDB> {
    @Column({
        type: DataType.UUID,
        allowNull: false,
        unique: 'unique_userId',
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id: string;

    @ApiProperty()
    @IsEmail
    @Column({
        allowNull: false,
        unique: 'unique_user_email',
    })
    email: string;

    @ApiProperty()
    @Column({
        allowNull: false,
        unique: 'unique_username',
    })
    username: string;

    @Column({
        allowNull: false,
    })
    password: string;

    @ApiProperty()
    @Column({
        allowNull: false,
    })
    firstName: string;

    @ApiProperty()
    @Column({
        allowNull: false,
    })
    lastName: string;

    @Column({
        allowNull: false,
        type: DataType.ENUM({
            values: Object.keys(UserDBRole).map((k) => UserDBRole[k]),
        }),
        comment: 'สิทธิ์การเข้าใช้งาน',
        defaultValue: UserDBRole.user,
    })
    role: UserDBRole;

    @ApiProperty()
    @Column({
        comment: 'status เปิด ปิด',
        defaultValue: true,
        allowNull: false,
    })
    status: boolean;

    @ApiProperty()
    @Column({
        allowNull: true,
    })
    image: string;

    @ApiProperty()
    @Column({
        allowNull: true,
        type: DataType.ENUM({
            values: Object.keys(UserDBGender).map((k) => UserDBGender[k]),
        }),
        comment: 'เพศ',
    })
    gender: UserDBGender;

    @ApiProperty()
    @Column({
        type: DataType.TEXT('long'),
        defaultValue: null,
        allowNull: true,
    })
    phoneNumber: string;

    @ApiProperty()
    @Column({
        defaultValue: false,
        allowNull: false,
    })
    isDelete: boolean;

    @CreatedAt
    readonly createdAt?: Date;

    @UpdatedAt
    readonly updatedAt?: Date;

    // ─────────────────────────────────────────────────────────────────

    @HasMany(() => UserSocketDB)
    userSocketLists: UserSocketDB[];

    @HasMany(() => LogBeforeDB)
    logBeforeLists: LogBeforeDB[];

    @HasMany(() => UserPasswordDB)
    userPasswordLists: UserPasswordDB[];

    @HasMany(() => DocumentDB)
    documentDBLists: DocumentDB[];

    @HasMany(() => DocHistoryDB)
    docHistoryDBLists: DocHistoryDB[];

    @HasMany(() => UserAgencyDB)
    userAgencyLists: UserAgencyDB[];

    @HasMany(() => DocumentApproveDB)
    documentApproveLists: DocumentApproveDB[];

    // @HasMany(() => UserAgencyDB)
    // userAgencyList: UserAgencyDB[];
}

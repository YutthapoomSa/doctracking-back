import { ApiProperty } from '@nestjs/swagger';
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { DocumentDB } from './document.entity';
import { UserDB } from './user.entity';
@Table({
    tableName: 'log_before',
    comment: 'log การเเก้ไขเอกสาร',
})
export class LogBeforeDB extends Model<LogBeforeDB> {
    @Column({
        type: DataType.UUID,
        allowNull: false,
        unique: 'unique_logBefore_id',
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id: string;

    @ApiProperty()
    @Column({
        allowNull: false,
        comment: 'ชื่อเอกสาร',
    })
    name: string;

    @ApiProperty()
    @Column({
        allowNull: true,
        comment: 'รายละเอียด',
        defaultValue: null,
    })
    detail: string;

    @ApiProperty()
    @Column({
        allowNull: true,
        comment: 'หมายเลขรหัสหนังสือราชการ',
        defaultValue: null,
    })
    governmentDocNo: string;

    @ApiProperty()
    @Column({
        allowNull: true,
        comment: 'หมายเลขรหัสหนังสือราชการภายใน',
        defaultValue: null,
        // unique: 'doc_no',
    })
    docNo: string;

    @ApiProperty()
    @Column({
        allowNull: true,
        comment: 'จากใคร',
        defaultValue: null,
        // unique: 'form_doc',
    })
    formDoc: string;

    @ApiProperty()
    @Column({
        allowNull: true,
        comment: 'ถึงใคร',
        defaultValue: null,
        // unique: 'to_doc',
    })
    toDoc: string;

    @ApiProperty()
    @Column({
        allowNull: true,
        comment: 'ความสำคัญของเอกสาร',
        defaultValue: null,
    })
    priority: string;

    @ApiProperty()
    @Column({
        allowNull: false,
        // unique: 'barcode_no',
    })
    barcode: string;

    @ApiProperty()
    @Column({
        allowNull: true,
        comment: 'ประเภทเอกสาร',
        defaultValue: null,
    })
    documentType: string;

    @ApiProperty()
    @Column({
        allowNull: true,
        comment: 'วันเดือนปี ในเอกสาร ',
        defaultValue: null,
    })
    readonly recipientAt: string;

    @ApiProperty()
    @Column({
        allowNull: true,
        defaultValue: null,
    })
    isCancel: boolean;

    @ApiProperty()
    @Column({
        allowNull: true,
        defaultValue: null,
    })
    isExternal: boolean;

    @ApiProperty()
    @Column({
        allowNull: true,
        defaultValue: null,
    })
    externalAgencyName: string;

    @ApiProperty()
    @Column({
        allowNull: true,
        defaultValue: null,
    })
    externalDate: string;

    @ApiProperty()
    @Column({
        type: DataType.TEXT('long'),
        allowNull: true,
        defaultValue: null,
    })
    files: string;


    // ────────────────────────────────────────────────────────────────────────────────
    @ForeignKey(() => DocumentDB)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    documentId: string;

    @BelongsTo(() => DocumentDB)
    document: DocumentDB;

    // ────────────────────────────────────────────────────────────────────────────────
    @ForeignKey(() => UserDB)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    userId: string;

    @BelongsTo(() => UserDB)
    user: UserDB;
}

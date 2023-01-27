import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
@Table({
    tableName: 'doc_file_zip_temp',
    comment: 'ไฟล์เอกสารสำหรับเก็บชื่่อ file zip พร้อมวันหมดอายุ',
})
export class DocFileZipTempDB extends Model<DocFileZipTempDB> {
    @Column({
        type: DataType.UUID,
        allowNull: false,
        unique: 'unique_docFileZipTemp_id',
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id: string;

    @ApiProperty()
    @Column({
        allowNull: false,
        comment: 'ชื่อไฟล์ zip',
    })
    fileZipName: string;

    @ApiProperty()
    @Column({
        allowNull: false,
        comment: 'วันหมดอายุไฟล์ zip',
    })
    expire: string;
}

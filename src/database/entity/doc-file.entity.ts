import { ApiProperty } from '@nestjs/swagger';
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { DocumentDB } from './document.entity';
import { v4 as uuidv4 } from 'uuid';
@Table({
    tableName: 'doc_file',
    comment: 'ไฟล์เอกสาร',
})
export class DocFileDB extends Model<DocFileDB> {
    @Column({
        type: DataType.UUID,
        allowNull: false,
        unique: 'unique_docFile_id',
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id: string;

    @ApiProperty()
    @Column({
        allowNull: false,
        comment: 'ชื่อไฟล์เอกสาร',
    })
    fileName: string;

    @ApiProperty()
    @Column({
        allowNull: false,
        comment: 'ขนาดไฟล์',
        defaultValue: 0,
    })
    fileSize: number;

    // ────────────────────────────────────────────────────────────────────────────────
    @ForeignKey(() => DocumentDB)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    documentId: string;

    @BelongsTo(() => DocumentDB)
    document: DocumentDB;
}

import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { DataBase } from './../../../database/database.providers';
import { DocumentApproveDB, EnumDocumentApproveDB } from './../../../database/entity/document-approve.entity';

@Injectable()
export class DocumentApproveService {
    private logger = new Logger(DocumentApproveService.name);
    constructor(
        @Inject(DataBase.DocumentApproveDB) private readonly documentApproveDBRepository: typeof DocumentApproveDB,
    ) {}

    async create(agencyId: string, documentId: string, _t?: Transaction) {
        const tag = this.create.name;
        try {
            const _documentApproveDB = new DocumentApproveDB();
            _documentApproveDB.agencyId = agencyId;
            _documentApproveDB.documentId = documentId;
            _documentApproveDB.userId = null;
            await _documentApproveDB.save({ transaction: _t ? _t : null });
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ────────────────────────────────────────────────────────────────────────────────

    async updateApprove(userId: string, documentId: string, status: EnumDocumentApproveDB, _t?: Transaction) {
        const tag = this.updateApprove.name;
        try {
            const findResult = await this.documentApproveDBRepository.findOne({
                where: {
                    documentId,
                },
            });

            if (!findResult) {
                throw new Error('documentApprove not found.');
            }

            findResult.status = status;
            findResult.userId = userId;

            // await _documentApproveDB.save({ transaction: _t ? _t : null });
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ────────────────────────────────────────────────────────────────────────────────

    async remove_by_documentId(_documentId: string, _t?: Transaction) {
        const tag = this.remove_by_documentId.name;
        try {
            return await this.documentApproveDBRepository.destroy({
                where: {
                    documentId: _documentId,
                },
                transaction: _t ? _t : null,
            });
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async change_by_documentId(_documentId: string, agencyId: string, _t?: Transaction) {
        const tag = this.remove_by_documentId.name;
        try {
            const result = await this.documentApproveDBRepository.findOne({
                where: {
                    documentId: _documentId,
                },
            });

            if (result) {
                if (result.userId !== null) {
                    throw new Error('เอกสารดังกล่าวผ่านการอนุมัติ เรียบร้อยไม่สามารแก้ไขได้');
                }
                result.agencyId = agencyId;
                await result.save({ transaction: _t ? _t : null });
                return result;
            } else {
                return await this.create(agencyId, _documentId);
            }
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

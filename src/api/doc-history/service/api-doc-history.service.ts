import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AcceptDocHistoryResDto } from '../dto/accept-create-doc-history.dto';
import { CreateDocHistoryDtoReq, DocHistoryResDto } from '../dto/create-doc-history.dto';
import { DataBase } from './../../../database/database.providers';
import { DocumentRoutingDB } from './../../../database/entity/document-routing.entity';
import { UserAgencyDB } from './../../../database/entity/user-agency.entity';
import { UserDB } from './../../../database/entity/user.entity';
import { LogService } from './../../../helper/services/log.service';
import { ResStatus } from './../../../shared/enum/res-status.enum';
import { UpdateDocHistoryDto } from './../dto/update-doc-history.dto';
import { DocHistoryService } from './doc-history.service';

@Injectable()
export class ApiDocHistoryService {
    private logger = new LogService(ApiDocHistoryService.name);

    constructor(
        @Inject(forwardRef(() => DocHistoryService))
        private docHistoryService: DocHistoryService,
        @Inject(DataBase.DocumentRoutingDB) private readonly docRoutingRepository: typeof DocumentRoutingDB,
        @Inject(DataBase.UserAgencyDB) private readonly userAgencyRepository: typeof UserAgencyDB,
    ) {}

    // [function]────────────────────────────────────────────────────────────────────────────────

    async api_create(user: UserDB, createDocumentDto: CreateDocHistoryDtoReq) {
        const tag = this.api_create.name;
        try {
            const resultDocHistory = await this.docHistoryService.create(user.id, createDocumentDto);
            return new DocHistoryResDto(ResStatus.success, '', resultDocHistory);
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async api_update(id: string, updateDocHistoryDto: UpdateDocHistoryDto) {
        const tag = this.api_update.name;
        try {
            await this.docHistoryService
                .update(id, updateDocHistoryDto)
                .then((response) => {
                    return new DocHistoryResDto(ResStatus.success, 'อัพเดตสำเร็จ', response);
                })
                .catch((error) => {
                    return new DocHistoryResDto(ResStatus.fail, 'อัพเดตไม่สำเร็จ', null);
                });
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async api_accept_doc(user: UserDB, body: CreateDocHistoryDtoReq[]): Promise<AcceptDocHistoryResDto> {
        const tag = this.api_accept_doc.name;
        try {
            const resultDocHistory = await this.docHistoryService.createAcceptDoc(user.id, body);
            return new AcceptDocHistoryResDto(ResStatus.success, '', resultDocHistory);
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async testUserDecorator(user: UserDB) {
        const tag = this.testUserDecorator.name;
        try {
            const userAgency = await this.userAgencyRepository.findOne({
                where: {
                    userId: user.id,
                },
            });
            if (!!userAgency.agencySecondary) {
                console.log('agency secondary -> ', userAgency.agencySecondaryId);
            } else {
                console.log('agency secondary -> ', userAgency.agencyId);
            }
            return userAgency;
        } catch (error) {
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

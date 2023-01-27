import { HttpException, HttpStatus, Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { CreateAgencyDTOReq, CreateAgencyResDTO } from '../dto/create-agency.dto';
import { AgencyPaginationDTO } from '../dto/pagination-agency.dto';
import { UpdateAgencyDto } from '../dto/update-agency.dto';
import { DataBase } from './../../../database/database.providers';
import { AgencyDB } from './../../../database/entity/agency.entity';
import { UserDB } from './../../../database/entity/user.entity';
import { LogService } from './../../../helper/services/log.service';
import { PaginationService } from './../../../helper/services/pagination/pagination.service';
import { ResStatus } from './../../../shared/enum/res-status.enum';
import { GlobalResDTO } from './../../global-dto/global-res.dto';
import { CreateAgencySecondaryDTOReq, CreateAgencySecondaryResDTO } from './../dto/create-agency-secondary.dto';
import { GetAgencyResDTO } from './../dto/get-agency.dto';
import { GetAllAgencySecondaryResDTO } from './../dto/get-all-agency-secondary.dto';
import { AgencyService } from './agency.service';

@Injectable()
export class ApiAgencyService implements OnApplicationBootstrap {
    private logger = new LogService(ApiAgencyService.name);

    constructor(
        @Inject(DataBase.AgencyDB) private readonly agencyRepository: typeof AgencyDB,
        private agencyService: AgencyService,
        private paginationService: PaginationService,
    ) {}
    onApplicationBootstrap() {
        //
    }

    // [function]────────────────────────────────────────────────────────────────────────────────

    async api_create(user: UserDB, createAgencyDto: CreateAgencyDTOReq): Promise<CreateAgencyResDTO> {
        const tag = this.api_create.name;
        try {
            const result = await this.agencyService.create(user, createAgencyDto);
            return new CreateAgencyResDTO(ResStatus.success, 'สร้างหน่วยงานสำเร็จ', result);
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async api_update(user: UserDB, id: string, updateAgencyDto: UpdateAgencyDto): Promise<CreateAgencyResDTO> {
        const tag = this.api_update.name;
        try {
            let res: CreateAgencyResDTO = null;
            await this.agencyService
                .update(id, updateAgencyDto)
                .then((response) => {
                    res = new CreateAgencyResDTO(ResStatus.success, 'อัพเดตหน่วยงานสำเร็จ', response);
                })
                .catch((error) => {
                    console.error(error);
                    res = new CreateAgencyResDTO(ResStatus.fail, 'กรุณาตรวจสอบความถูกต้องของข้อมูล', null);
                });
            return res;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async api_del(user: UserDB, _id: string): Promise<GlobalResDTO> {
        const tag = this.api_del.name;
        try {
            let res: GlobalResDTO = null;
            await this.agencyService
                .remove(_id)
                .then((resp) => {
                    if (resp === 0) {
                        res = new GlobalResDTO(ResStatus.fail, 'ลบไม่สำเร็จ');
                    } else {
                        res = new GlobalResDTO(ResStatus.success, 'ลบสำเร็จ');
                    }
                })
                .catch((err) => {
                    res = new GlobalResDTO(ResStatus.fail, '');
                });

            return res;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async api_pagination(paginationDTO: AgencyPaginationDTO) {
        const tag = this.api_pagination.name;
        try {
            //
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async api_create_agency_secondary(
        user: UserDB,
        createAgencyDto: CreateAgencySecondaryDTOReq,
    ): Promise<CreateAgencySecondaryResDTO> {
        const tag = this.api_create_agency_secondary.name;
        try {
            const result = await this.agencyService.createAgencySecondary(user, createAgencyDto);
            return new CreateAgencySecondaryResDTO(ResStatus.success, 'สร้างหน่วยงานสำเร็จ', result);
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async api_get_all_agency_secondary(user: UserDB, agencyId: string) {
        const tag = this.api_create_agency_secondary.name;
        try {
            const result = await this.agencyService.getAllAgencySecondary(user, agencyId);
            // return result;
            return new GetAllAgencySecondaryResDTO(ResStatus.success, 'ดึงข้อมูลหน่วยงานสำเร็จ', result);
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async api_get_agency(user: UserDB, agencyId: string) {
        const tag = this.api_get_agency.name;
        try {
            const result = await this.agencyService.getAgency(user, agencyId);
            // return result;
            return new GetAgencyResDTO(ResStatus.success, 'ดึงข้อมูลหน่วยงานสำเร็จ', result);
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

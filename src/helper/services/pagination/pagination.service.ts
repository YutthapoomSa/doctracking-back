import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import { LogService } from './../log.service';

@Injectable()
export class PaginationService {
    private logger = new LogService(PaginationService.name);
    /**
     * @param total //จำนวนที่ข้าม
     * @param perPage //จำนวนข้อมูลทั้งหมด
     * @param pageCurrent //จำนวนข้อมูลลำดับสุดท้ายที่จะดึง
     * @returns
     */
    paginationCal(total: number, perPage: number, pageCurrent: number) {
        return {
            skips: perPage * pageCurrent - perPage, // จำนวนที่ข้าม
            totalPages: Math.ceil(total / perPage), // จำนวนข้อมูลทั้งหมด
            limit: perPage, // จำนวนข้อมูลลำดับสุดท้ายที่จะดึง
        };
    }

    genSqlLike(attributes: string[], textSearch: string): any {
        try {
            if (attributes.length === 0) throw new Error('attributes empty.');
            if (!textSearch) throw new Error('textSearch empty.');
            const likes = [];
            attributes.forEach(x => {
                const obj = {};
                obj[`${x}`] = { [Op.like]: `%${textSearch}%` };
                likes.push(obj);
            });
            if (likes.length === 0) return null;
            return { where: { [Op.or]: likes } };
        } catch (error) {
            this.logger.error(`genSqlLike -> ${error}`);
        }
        return null;
    }
}

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { LogService } from '../log.service';
import { SetDataLineNotify } from './interface/line-notify.interface';

@Injectable()
export class LineNotifyService {
    private readonly endPoint = 'https://notify-api.line.me/api/notify';
    private logger = new LogService(LineNotifyService.name);

    constructor(private httpService: HttpService) {}

    async setData(data: SetDataLineNotify) {
        const tag = this.setData.name;
        try {
            if (data.message) {
                await this.callLineNotify(data.message, data.tokenLine);
            }
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
        }
    }
    private async callLineNotify(message: string, tokenLine: string) {
        const tag = this.callLineNotify.name;
        try {
            const params = new URLSearchParams();
            params.append('message', message);
            console.log('params', params);

            return new Promise((resolve, reject) => {
                this.httpService
                    .post(`${this.endPoint}`, params, {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            Authorization: 'Bearer' + ' ' + tokenLine,
                        },
                    })
                    .subscribe(
                        (resp) => {
                            this.logger.debug('success');
                            this.logger.debug('RESP LINE -> ', resp.data);
                            return resolve(resp.data);
                        },
                        (error) => {
                            this.logger.error(error);
                            return reject(error);
                        },
                    );
            });
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
        }
    }
}

/*
https://docs.nestjs.com/providers#services
*/
import { Injectable } from '@nestjs/common';
import CryptoJS from 'crypto-js';
import { ConfigService } from './../../shared/config/config.service';

@Injectable()
export class EncryptionService {
    constructor(private configService: ConfigService) {}
    decode(textEncryption: string) {
        textEncryption = textEncryption.split('xMl3Jk').join('+');
        textEncryption = textEncryption.split('Por21Ld').join('/');
        textEncryption = textEncryption.split('Ml32').join('=');
        const text = CryptoJS.AES.decrypt(textEncryption, this.configService.loginConfig.privateKey.loginPrivateKey);
        return text.toString(CryptoJS.enc.Utf8);
    }

    encode(textEncryption: string): string {
        let data = CryptoJS.AES.encrypt(
            textEncryption,
            this.configService.loginConfig.privateKey.loginPrivateKey,
        ).toString();
        data = data.split('+').join('xMl3Jk');
        data = data.split('/').join('Por21Ld');
        data = data.split('=').join('Ml32');
        return data;
    }
}

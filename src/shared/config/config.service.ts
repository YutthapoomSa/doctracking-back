import { Injectable } from '@nestjs/common';
import config from '../../../config';

@Injectable()
export class ConfigService {
    get sequelizeOrmConfig() {
        return config.database;
    }

    get jwtConfig() {
        return { privateKey: config.jwtPrivateKey };
    }

    get loginConfig() {
        return { privateKey: config.loginConfig };
    }

    get omiseConfig() {
        return {
            secretKey: config.omiseConfig.secretKey,
        };
    }
    get genPointUpload() {
        return {
            endpoint: config.imagePath.uploadEndpoint,
        };
    }

    get getImagePath() {
        return config.imagePath;
    }
}

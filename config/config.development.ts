import { Dialect } from 'sequelize/types';
import { LogService } from './../src/helper/services/log.service';
const logger = new LogService('ORM');

export const config = {
    database: {
        dialect: 'mysql' as Dialect,
        host: '35.240.230.75',
        port: 3306,
        username: 'db_track_document',
        password: '4Wa%1qx8',
        database: 'db_track_document',
        // logging: false,
        logging: (msg: any, benchmark: any) => logger.db(`${msg} Elapsed time: ${benchmark} ms`),
        // dialectOptions: {
        //     useUTC: false,
        // },
        timezone: '+07:00', // for writing to database
        // charset: 'utf8mb4',
        benchmark: true,
    },
    jwtPrivateKey: 'jwtPrivateKey',
    loginConfig: {
        encryption: true,
        loginPrivateKey: 'siamIT9999',
    },
    pool: {
        max: 15,
        min: 5,
        idle: 20000,
        evict: 15000,
        acquire: 30000,
    },
    benchmark: true,
    omiseConfig: {
        secretKey: 'skey_test_5p3j5dqd18pcn3wqhak',
    },
    imagePath: {
        uploadEndpoint: 'http://localhost:3000/storage',
        userImagePath: 'http://localhost:3000/userImage',
        docPath: 'http://localhost:3000/doc',
    },
};

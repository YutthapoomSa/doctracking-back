import { Dialect } from 'sequelize/types';

export const config = {
    database: {
        dialect: 'postgres' as Dialect,
        host: process.env.DATABASE_HOST,
        port: +process.env.DATABASE_PORT,
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_DATABASE,
        logging: false,
    },
    jwtPrivateKey: process.env.JWT_PRIVATE_KEY,
    loginConfig: {
        encryption: false,
        loginPrivateKey: 'siamIT9999',
    },
    omiseConfig: {
        secretKey: 'skey_test_5p3j5dqd18pcn3wqhak',
    },
    imagePath: {
        uploadEndpoint: 'http://localhost:3000/storage',
        userImagePath: 'http://localhost:3000/userImage',
        docPath: 'http://localhost:3000/doc',
    },
};

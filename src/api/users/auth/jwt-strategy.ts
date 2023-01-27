import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { UsersService } from '../services/users.service';
import { EncryptionService } from './../../../helper/services/encryption.service';
import { LogService } from './../../../helper/services/log.service';
import { ConfigService } from './../../../shared/config/config.service';
import { JwtPayload } from './jwt-payload.model';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private logger = new LogService(JwtStrategy.name);
    constructor(
        private readonly usersService: UsersService,
        private configService: ConfigService,
        private encryptionService: EncryptionService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.jwtConfig.privateKey,
        });
    }

    async validate(payload: JwtPayload, done: VerifiedCallback) {
        try {
            if (!payload && !payload.id) {
                return done(new HttpException({}, HttpStatus.UNAUTHORIZED), false);
            }

            const key = this.configService.loginConfig.privateKey.loginPrivateKey;
            // ─────────────────────────────────────────────────────────────────

            payload.id = this.encryptionService.decode(payload.id);
            payload.jit = this.encryptionService.decode(payload.jit);
            payload.role = this.encryptionService.decode(payload.role);

            const isToken = await this.usersService.verifyAccessToken(payload.jit);
            if (!isToken) return done(new HttpException({}, HttpStatus.UNAUTHORIZED), false);

            return done(null, payload, payload.iat);
        } catch (error) {
            this.logger.error(error);
            return done(new HttpException(error, HttpStatus.UNAUTHORIZED), false);
        }
    }
}

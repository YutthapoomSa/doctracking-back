import { SetMetadata } from '@nestjs/common';
import { Role } from './role.enum';
/*
https://docs.nestjs.com/openapi/decorators#decorators
*/

//  import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// export const Roles = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
//     const request = ctx.switchToHttp().getRequest();
//     return request.user;
// });

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

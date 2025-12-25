/**
 * ===============================================
 * DECORATORS PERSONALIZADOS
 * ===============================================
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from '../../modules/auth/entities/user.entity';

/**
 * Obtener usuario actual de la request
 * @GetUser() user: UserEntity
 */
export const GetUser = createParamDecorator(
  (data: keyof UserEntity | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);

/**
 * EJEMPLO DE USO:
 * 
 * @Get('profile')
 * getProfile(@GetUser() user: UserEntity) {
 *   return user;
 * }
 * 
 * @Get('email')
 * getEmail(@GetUser('email') email: string) {
 *   return { email };
 * }
 */

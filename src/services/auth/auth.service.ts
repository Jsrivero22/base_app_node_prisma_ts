import { prisma } from '@postgres';
import { LoginUserDto } from 'src/controllers/auth/dtos';
import { UserEntity } from '../users/entity';
import { CustomError } from 'src/errors/custom.error';
import { RoleModel, Status, UserModel } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { EncryptedAdapter } from 'src/config/adapters/bcrypt.adapter';
import { JWT } from 'src/config/adapters/jwt.adapter';
import { RoleEntity } from '../roles/entity';
import { TokenType } from 'src/types/jwt';
import { UserPermissions } from 'src/types/auth';

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MINUTES = 1;

export class AuthService {
    private readonly module = 'AuthService';
    private readonly prismaService: typeof prisma = prisma;

    constructor(private readonly userService: UsersService) {}

    async login(
        loginUserDto: LoginUserDto,
        user: UserModel,
        roles: RoleEntity[],
    ): Promise<UserEntity> {
        const { password } = loginUserDto;

        const passwordMatch = EncryptedAdapter.compare(password, user.password);

        if (!passwordMatch) {
            await this.handleFailedLoginAttempt(user);
            throw CustomError.forbidden(
                'User or password incorrect',
                this.module,
                'execute',
            );
        }

        const token = JWT.tokenSign(
            {
                id: user.id,
                status: user.status,
                // userType: user.userType,
                roles: roles.map(role => role.id),
            },
            '12h',
        );

        const updatedUser = await this.resetFailedLoginAttemptsIfNecessary(
            user,
            token,
        );

        return UserEntity.fromObject(updatedUser);
    }

    async handleFailedLoginAttempt(user: UserModel): Promise<void> {
        user.failedLoginAttempts++;

        if (
            user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS &&
            !user.lockoutExpiry
        ) {
            user.lockoutExpiry = new Date();
            user.lockoutExpiry.setMinutes(
                user.lockoutExpiry.getMinutes() + LOCKOUT_DURATION_MINUTES,
            );
        }

        await this.userService.updateUserById(user.id, {
            failedLoginAttempts: user.failedLoginAttempts,
            lockoutExpiry: user.lockoutExpiry,
            tokenSession: null,
        });
    }

    async resetFailedLoginAttemptsIfNecessary(
        user: UserModel,
        tokenSession: UserModel['tokenSession'],
    ) {
        if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
            user.failedLoginAttempts = 0;
            user.lockoutExpiry = null;
            return await this.userService.updateUserById(
                user.id,
                {
                    failedLoginAttempts: user.failedLoginAttempts,
                    lockoutExpiry: user.lockoutExpiry,
                    tokenSession,
                },
                { roles: { select: { id: true, name: true } } },
            );
        }

        return await this.userService.updateUserById(user.id, {
            tokenSession,
            lastLoginAt: new Date(),
        });
    }

    async authenticate(token: string) {
        if (!token) {
            throw CustomError.unauthorized('No token provided');
        }

        const { id } = JWT.tokenVerify<{ id: string }>(token);

        const user = await this.userService.findUserWithRolesAndPermissions(id);

        if (!user || user.status !== Status.ACTIVE) {
            throw CustomError.unauthorized(
                'User is inactive or does not exist',
            );
        }

        console.log(user.tokenSession);
        console.log(token);

        if (!token || user.tokenSession !== token) {
            throw CustomError.unauthorized('Invalid token');
        }

        return {
            id: user.id,
            roles: user.roles.map(role => role.name),
            permissions: user.roles.flatMap(role =>
                role.roleModulePermissions.map(rmp => ({
                    permission: rmp.permission.permissionType.name,
                    module: rmp.permission.module.name,
                })),
            ),
        };
    }

    hasPermission(
        user: UserPermissions,
        requiredPermission: string,
        module: string,
    ) {
        const permissionLower = requiredPermission.toLowerCase();

        const data = user.permissions.some(
            permission =>
                (permission.permission.toLowerCase() === permissionLower ||
                    permission.permission.toLowerCase() === 'all_data') &&
                permission.module === module,
        );
        console.log(data);

        return user.permissions.some(
            permission =>
                (permission.permission.toLowerCase() === permissionLower ||
                    permission.permission.toLowerCase() === 'all_data') &&
                permission.module === module,
        );
    }
}

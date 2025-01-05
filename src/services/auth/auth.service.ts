import { prisma } from '@postgres';
import { LoginUserDto } from 'src/controllers/auth/dtos';
import { UserEntity } from '../users/entity';
import { CustomError } from 'src/errors/custom.error';
import { UserModel } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { EncryptedAdapter, JWT } from 'src/config/adapters';

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MINUTES = 1;

export class AuthService {
    private readonly module = 'AuthService';
    private readonly prismaService: typeof prisma = prisma;

    constructor(private readonly userService: UsersService) {}

    async login(
        loginUserDto: LoginUserDto,
        user: UserModel,
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
                userType: user.userType,
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
            return await this.userService.updateUserById(user.id, {
                failedLoginAttempts: user.failedLoginAttempts,
                lockoutExpiry: user.lockoutExpiry,
                tokenSession,
            });
        }

        return await this.userService.updateUserById(user.id, {
            tokenSession,
            lastLoginAt: new Date(),
        });
    }
}

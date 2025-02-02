import { CustomError } from '@errors/custom.error';
import { UserModel } from '@prisma/client';
import { UsersService } from 'src/services/users/users.service';

interface ValidateUserAuth {
    execute(idUser: UserModel['id'], token: string): Promise<void>;
}

export class ValidateUserAuthUseCase implements ValidateUserAuth {
    private readonly module = 'ValidateUserAuthUseCase';

    constructor(private readonly userService: UsersService) {}

    async execute(idUser: UserModel['id'], token: string): Promise<void> {
        const user = await this.userService.findById(idUser, {
            roles: {
                select: {
                    name: true,
                    roleModulePermissions: {
                        select: {
                            permission: {
                                select: {
                                    permissionType: {
                                        select: { name: true },
                                    },
                                    module: { select: { name: true } },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (user.tokenSession !== token) {
            throw CustomError.unauthorized(
                'Invalid token',
                this.module,
                'execute',
            );
        }

        if (
            user.emailVerificationTokenExpiry &&
            user.emailVerificationTokenExpiry < new Date()
        ) {
            throw CustomError.badRequest(
                'Token expired, please request a new verification email',
                this.module,
                'execute',
            );
        }

        if (user.emailVerified) {
            throw CustomError.badRequest(
                'Email already verified',
                this.module,
                'execute',
            );
        }

        if (user.status !== 'ACTIVE') {
            throw CustomError.badRequest(
                'User is not active, please contact support',
                this.module,
                'execute',
            );
        }
    }
}

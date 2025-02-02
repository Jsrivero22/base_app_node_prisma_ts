import { UserModel } from '@prisma/client';
import { EncryptedAdapter } from 'src/config/adapters/bcrypt.adapter';
import { CustomError } from 'src/errors/custom.error';
import { UsersService } from 'src/services/users/users.service';

interface ChangePassword {
    execute(
        email: UserModel['email'],
        password: UserModel['password'],
        token: string,
    ): Promise<void>;
}

export class ChangePasswordUserUseCase implements ChangePassword {
    private readonly module = 'ChangePasswordUserUseCase';

    constructor(private readonly userService: UsersService) {}

    async execute(
        email: UserModel['email'],
        password: UserModel['password'],
        token: string,
    ): Promise<void> {
        const user = await this.userService.findByEmail(email);

        if (
            user.passwordResetToken !== token ||
            !user.passwordResetTokenExpiry
        ) {
            throw CustomError.notFound(
                'Token not found',
                this.module,
                'execute',
            );
        }

        const passwordChangedAt = new Date();

        if (user.passwordResetTokenExpiry < passwordChangedAt) {
            throw CustomError.unauthorized(
                'Token expired, please request a new one',
                this.module,
                'execute',
            );
        }

        await this.userService.updateUserById(user.id, {
            password: EncryptedAdapter.encrypt(password),
            tokenSession: null,
            passwordResetToken: null,
            passwordResetTokenExpiry: null,
            passwordChangedAt,
        });
    }
}

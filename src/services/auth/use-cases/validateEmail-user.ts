import { Status } from '@prisma/client';
import { JWT } from 'src/config/adapters/jwt.adapter';
import { CustomError } from 'src/errors/custom.error';
import { UsersService } from 'src/services/users/users.service';
import { TokenType } from 'src/types/jwt';

interface ValidateEmailUser {
    execute(token: string): Promise<boolean>;
}

export class ValidateEmailUserUseCase implements ValidateEmailUser {
    private readonly module = 'ValidateEmailUserUseCase';

    constructor(private readonly userService: UsersService) {}

    async execute(token: string): Promise<boolean> {
        const tokenVerified = JWT.tokenVerify<TokenType>(token);

        const { id, status } = tokenVerified;

        const user = await this.userService.findById(id);
        if (user.emailVerificationToken !== token) {
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

        if (status !== Status.ACTIVE) {
            throw CustomError.badRequest(
                'User is not active, please contact support',
                this.module,
                'execute',
            );
        }

        const updatedUser = await this.userService.updateUserById(id, {
            emailVerified: true,
            emailVerificationToken: null,
            emailVerificationTokenExpiry: null,
        });

        return updatedUser.emailVerified ? true : false;
    }
}

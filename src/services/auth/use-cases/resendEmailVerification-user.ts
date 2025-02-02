import { JWT } from 'src/config/adapters/jwt.adapter';
import { CustomError } from 'src/errors/custom.error';
import { UsersService } from 'src/services/users/users.service';
import { ExpiryDateGenerator } from 'src/utils/expiryDateGenerator';

interface ResendEmailVerificationUser {
    execute(email: string): Promise<void>;
}

export class ResendEmailVerificationUserUseCase
    implements ResendEmailVerificationUser
{
    private readonly module = 'ResendEmailVerificationUserUseCase';

    constructor(private readonly userService: UsersService) {}

    async execute(email: string): Promise<void> {
        const user = await this.userService.findByEmail(email);

        if (user.emailVerified) {
            throw CustomError.badRequest(
                'Email already verified',
                this.module,
                'execute',
            );
        }

        const emailVerificationToken = JWT.tokenSign(
            {
                id: user.id,
                userType: user.userType,
                status: user.status,
            },
            '30m',
        );

        if (!emailVerificationToken) {
            throw CustomError.internal(
                'Error signing email verification token',
                this.module,
                'execute',
            );
        }

        const tokenExpiry = ExpiryDateGenerator.fromMinutes(30);

        await this.userService.updateUserById(user.id, {
            emailVerificationToken,
            emailVerificationTokenExpiry: tokenExpiry,
        });
    }
}

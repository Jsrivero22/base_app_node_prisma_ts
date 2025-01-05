import { UserModel } from '@prisma/client';
import { JWT } from 'src/config/adapters';
import { CustomError } from 'src/errors/custom.error';
import { EmailService } from 'src/services/email/email.service';
import { UsersService } from 'src/services/users/users.service';
import { ExpiryDateGenerator } from 'src/utils/expiryDateGenerator';

interface GenerateTokenEmailVerificationUser {
    execute(email: UserModel['email']): Promise<void>;
}

export class GenerateTokenEmailVerificationUserUseCase
    implements GenerateTokenEmailVerificationUser
{
    private readonly module = 'GenerateTokenEmailVerificationUserUseCase';

    constructor(
        private readonly userService: UsersService,
        private readonly emailService: EmailService,
    ) {}

    async execute(email: UserModel['email']): Promise<void> {
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
                status: user.status,
                userType: user.userType,
            },
            '30m',
        );

        await this.userService.updateUserById(user.id, {
            emailVerificationToken,
            emailVerificationTokenExpiry: ExpiryDateGenerator.fromMinutes(30),
        });

        await this.emailService.sendPasswordResetEmail(
            emailVerificationToken,
            email,
        );
    }
}

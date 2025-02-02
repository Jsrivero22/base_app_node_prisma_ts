import { UserModel } from '@prisma/client';
import { JWT } from 'src/config/adapters/jwt.adapter';
import { CustomError } from 'src/errors/custom.error';
import { EmailService } from 'src/services/email/email.service';
import { RolesService } from 'src/services/roles/roles.service';
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
        private readonly rolesService: RolesService,
    ) {}

    async execute(email: UserModel['email']): Promise<void> {
        const user = await this.userService.findByEmail(email);
        const roles = await this.rolesService.findByUserId(user.id);

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
                roles: roles.map(role => role.id),
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

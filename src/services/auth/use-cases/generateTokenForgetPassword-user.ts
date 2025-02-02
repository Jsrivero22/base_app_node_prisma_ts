import { UserModel } from '@prisma/client';
import { JWT } from 'src/config/adapters/jwt.adapter';
import { EmailService } from 'src/services/email/email.service';
import { RolesService } from 'src/services/roles/roles.service';
import { UsersService } from 'src/services/users/users.service';
import { ExpiryDateGenerator } from 'src/utils/expiryDateGenerator';

interface GenerateTokenForgetPassword {
    execute(email: UserModel['email']): Promise<void>;
}

export class GenerateTokenForgetPasswordUseCase
    implements GenerateTokenForgetPassword
{
    private readonly module = 'GenerateTokenForgetPasswordUseCase';

    constructor(
        private readonly userService: UsersService,
        private readonly emailService: EmailService,
        private readonly rolesService: RolesService,
    ) {}

    async execute(email: UserModel['email']): Promise<void> {
        const user = await this.userService.findByEmail(email);
        const roles = await this.rolesService.findByUserId(user.id);

        const passwordResetToken = JWT.tokenSign(
            {
                id: user.id,
                status: user.status,
                roles: roles.map(role => role.id),
            },
            '30m',
        );

        await this.userService.updateUserById(user.id, {
            passwordResetToken,
            passwordResetTokenExpiry: ExpiryDateGenerator.fromMinutes(30),
        });

        await this.emailService.sendPasswordResetEmail(
            passwordResetToken,
            email,
        );
    }
}

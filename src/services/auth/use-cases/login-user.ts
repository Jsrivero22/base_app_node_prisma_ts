import { LoginUserDto } from 'src/controllers/auth/dtos';
import { UserEntity } from 'src/services/users/entity';
import {
    AuthService,
    LOCKOUT_DURATION_MINUTES,
    MAX_FAILED_ATTEMPTS,
} from '../auth.service';
import { UsersService } from 'src/services/users/users.service';
import { CustomError } from 'src/errors/custom.error';
import { Status } from '@prisma/client';
import { RolesService } from 'src/services/roles/roles.service';

export interface LoginUser {
    execute(dto: LoginUserDto): Promise<unknown>;
}

export class LoginUserUseCase implements LoginUser {
    private readonly module = 'AuthService';

    constructor(
        private readonly authService: AuthService,
        private readonly userService: UsersService,
        private readonly rolesService: RolesService,
    ) {}

    async execute(dto: LoginUserDto): Promise<UserEntity> {
        const user = await this.userService.findByEmail(dto.email);
        const roles = await this.rolesService.findByUserId(user.id);

        if (!user.emailVerified) {
            throw CustomError.forbidden(
                'Email not verified, please check your email or request a new verification email',
                this.module,
                'execute',
            );
        }

        if (
            user.accountLocked ||
            (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS &&
                user.lockoutExpiry &&
                user.lockoutExpiry > new Date())
        ) {
            throw CustomError.forbidden(
                `Account locked, please request email verification or wait until it is automatically unlocked in ${LOCKOUT_DURATION_MINUTES} minutes`,
                this.module,
                'execute',
            );
        }

        if (user.status !== Status.ACTIVE) {
            throw CustomError.forbidden(
                'User is not active or has been blocked, please contact support',
                this.module,
                'execute',
            );
        }

        return this.authService.login(dto, user, roles);
    }
}

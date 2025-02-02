import { CreateUserDto } from 'src/controllers/users/dtos';
import { UserEntity } from '../entity';
import { UsersService } from '../users.service';
import { RolesService } from 'src/services/roles/roles.service';
import { CustomError } from 'src/errors/custom.error';
import { UserType } from '@prisma/client';
import { EmailService } from 'src/services/email/email.service';

export interface CreateUser {
    execute(dto: CreateUserDto): Promise<UserEntity>;
}

export class CreateUserUseCase implements CreateUser {
    constructor(
        private readonly usersService: UsersService,
        private readonly rolesService: RolesService,
        private readonly emailService: EmailService,
    ) {}

    async execute(dto: CreateUserDto): Promise<UserEntity> {
        await this.usersService.validateExistingEmail(dto.email);

        if (dto.roles.length) {
            await this.validateRoles(dto.roles);
        } else {
            const role = await this.rolesService.findByName(UserType.USER);
            dto.roles = [role.id];
        }

        const user = await this.usersService.createUser(dto);

        if (user.emailVerificationToken) {
            await this.emailService
                .validationToken(user.emailVerificationToken, user.email)
                .catch(error => {
                    console.log(error);
                    throw CustomError.internal(
                        'Error sending email validation token',
                        'CreateUserUseCase',
                        'execute',
                    );
                });
        }

        return UserEntity.fromObject(user);
    }

    private async validateRoles(roles: string[]): Promise<void> {
        const existingRoles = await this.rolesService.findByIds(roles);

        if (existingRoles.length !== roles.length) {
            throw CustomError.notFound(
                'Some roles were not found',
                'CreateUserUseCase - validateRoles',
                'execute',
            );
        }
    }
}

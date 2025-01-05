import { Request, Response } from 'express';
import { CreateUserDto } from './dtos/create-user.dto';
import { CreateUserUseCase } from 'src/services/users/use-cases';
import { handleError } from 'src/errors';
import { EmailService, RolesService, UsersService } from 'src/services';

export class UsersController {
    constructor(
        private readonly userService: UsersService,
        private readonly rolesService: RolesService,
        private readonly emailService: EmailService,
    ) {}

    public createUser = (req: Request, res: Response) => {
        const userCreateDto = CreateUserDto.create(req.body);

        new CreateUserUseCase(
            this.userService,
            this.rolesService,
            this.emailService,
        )
            .execute(userCreateDto)
            .then(user => res.status(201).json(user))
            .catch(error => handleError(res, error));
    };
}

import { Request, Response } from 'express';
import { CreateUserDto } from '../users/dtos';
import {
    AuthService,
    EmailService,
    RolesService,
    UsersService,
} from 'src/services';
import { Success } from 'src/helpers';
import { handleError } from 'src/errors';
import { CreateUserUseCase } from 'src/services/users/use-cases';
import { LoginUserDto } from './dtos';
import { LoginUserUseCase } from 'src/services/auth/use-cases/login-user';
import { ValidateEmailUserUseCase } from 'src/services/auth/use-cases/validateEmail-user';
import { GenerateTokenEmailVerificationUserUseCase } from 'src/services/auth/use-cases/generateTokenEmailVerification-user';
import { GenerateTokenForgetPasswordUseCase } from 'src/services/auth/use-cases/generateTokenForgetPassword-user';
import { ChangePasswordUserUseCase } from 'src/services/auth/use-cases/changePassword-user';
import { LogoutUserUseCase } from 'src/services/auth/use-cases/logout-user';
import { JWT } from 'src/config/adapters';

export class AuthController {
    constructor(
        private readonly userService: UsersService,
        private readonly authService: AuthService,
        private readonly rolesService: RolesService,
        private readonly emailService: EmailService,
    ) {}

    register = (req: Request, res: Response) => {
        const userCreateDto = CreateUserDto.create(req.body);

        new CreateUserUseCase(
            this.userService,
            this.rolesService,
            this.emailService,
        )
            .execute(userCreateDto)
            .then(user => Success.created('User created', user).send(res))
            .catch(error => handleError(res, error));
    };

    login = (req: Request, res: Response) => {
        const loginUserDto = LoginUserDto.create(req.body);

        new LoginUserUseCase(this.authService, this.userService)
            .execute(loginUserDto)
            .then(user => {
                return Success.ok('User logged in', user).send(res);
            })
            .catch(error => handleError(res, error));
    };

    validateEmail = (req: Request, res: Response) => {
        const { token } = req.query;

        new ValidateEmailUserUseCase(this.userService)
            .execute(token as string)
            .then(() => Success.ok('Email verified').send(res))
            .catch(error => handleError(res, error));
    };

    resendEmailVerification = (req: Request, res: Response) => {
        const { email } = req.body;

        new GenerateTokenEmailVerificationUserUseCase(
            this.userService,
            this.emailService,
        )
            .execute(email)
            .then(() => Success.ok('Email verification sent').send(res))
            .catch(error => handleError(res, error));
    };

    forgotPassword = (req: Request, res: Response) => {
        const { email } = req.body;

        new GenerateTokenForgetPasswordUseCase(
            this.userService,
            this.emailService,
        )
            .execute(email)
            .then(() => Success.ok('Password reset email sent').send(res))
            .catch(error => handleError(res, error));
    };

    changePassword = (req: Request, res: Response) => {
        const { email, password, token } = req.body;

        new ChangePasswordUserUseCase(this.userService)
            .execute(email, password, token)
            .then(() => Success.ok('Password changed').send(res))
            .catch(error => handleError(res, error));
    };

    logoutUser = (req: Request, res: Response) => {
        const token = req.headers.authorization;
        if (!token) {
            return handleError(res, 'Token is required');
        }

        const tokenSplit = token.split(' ')[1];
        const id = JWT.tokenGetUserId(tokenSplit);

        new LogoutUserUseCase(this.userService)
            .execute(id)
            .then(() => Success.ok('User logged out').send(res))
            .catch(error => handleError(res, error));
    };
}

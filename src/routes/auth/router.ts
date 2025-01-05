import { Router } from 'express';
import { EmailAdapterGoogle, envs } from 'src/config/adapters';
import { AuthController } from 'src/controllers/auth/controller';
import {
    AuthService,
    EmailService,
    RolesService,
    UsersService,
} from 'src/services';
import { AuthValidators } from './validators';

export class AuthRoutes {
    static get routes(): Router {
        const router = Router();

        // const emailAdapter = new EmailAdapterSMTP({
        //     host: envs.SMTP_HOST,
        //     port: envs.SMTP_PORT,
        //     secure: envs.SMTP_SECURE,
        //     user: envs.SMTP_USER,
        //     password: envs.SMTP_PASS,
        //     from: envs.SENDER_EMAIL,
        // });

        const emailAdapter = new EmailAdapterGoogle({
            service: envs.MAIL_SERVICE,
            user: envs.SENDER_EMAIL,
            password: envs.MAILER_SECRET_KEY,
        });

        const emailService = new EmailService(emailAdapter);

        const rolesServices = new RolesService();
        const usersService = new UsersService();
        const authService = new AuthService(usersService);

        const controller = new AuthController(
            usersService,
            authService,
            rolesServices,
            emailService,
        );

        router.post('/register', AuthValidators.register, controller.register);

        router.post('/login', AuthValidators.login, controller.login);

        router.get(
            '/validate-email',
            AuthValidators.validateToken,
            controller.validateEmail,
        );

        router.post(
            '/resend-email-verification',
            AuthValidators.validateResendEmailToken,
            controller.resendEmailVerification,
        );

        router.post(
            '/forgot-password',
            AuthValidators.validateResendEmailToken,
            controller.forgotPassword,
        );

        router.post(
            '/change-password',
            AuthValidators.validateChangePassword,
            controller.changePassword,
        );

        router.get('/logout', AuthValidators.logout, controller.logoutUser);

        return router;
    }
}

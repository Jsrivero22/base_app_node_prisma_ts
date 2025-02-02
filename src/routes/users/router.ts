import { Router } from 'express';
import { UsersValidators } from './validators';
import { UsersController } from 'src/controllers';
import { EmailService, RolesService, UsersService } from 'src/services';
import { envs } from 'src/config/adapters/envs.adapter';
import { EmailAdapterSMTP } from 'src/config/adapters/emails.adapter';

export class UsersRoutes {
    static get routes(): Router {
        const router = Router();

        const emailAdapter = new EmailAdapterSMTP({
            host: envs.SMTP_HOST,
            port: envs.SMTP_PORT,
            secure: envs.SMTP_SECURE,
            user: envs.SMTP_USER,
            password: envs.SMTP_PASS,
            from: envs.SENDER_EMAIL,
        });

        const emailService = new EmailService(emailAdapter);

        const rolesServices = new RolesService();
        const usersServices = new UsersService();
        const controller = new UsersController(
            usersServices,
            rolesServices,
            emailService,
        );

        // router.get('/', controller.getUsers);
        // router.get('/:id', UsersValidators.getID, controller.getUser);
        router.post('/', UsersValidators.create, controller.createUser);
        // router.put('/:id', UsersValidators.update, controller.updateUser);
        // router.delete('/:id', UsersValidators.delete, controller.deleteUser);

        return router;
    }
}

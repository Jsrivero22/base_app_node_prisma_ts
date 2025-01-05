import { Router } from 'express';
import { UsersValidators } from './validators';
import { UsersController } from 'src/controllers';
import { EmailService, RolesService, UsersService } from 'src/services';
import { EmailAdapterGoogle, envs } from 'src/config/adapters';

export class UsersRoutes {
    static get routes(): Router {
        const router = Router();

        const emailAdapter = new EmailAdapterGoogle({
            service: envs.MAIL_SERVICE,
            user: envs.SENDER_EMAIL,
            password: envs.MAILER_SECRET_KEY,
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

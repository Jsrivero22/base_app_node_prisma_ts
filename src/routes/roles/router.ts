import { Router } from 'express';
import { RolesController } from '@controllers/index';
import { RolesService } from '@services/index';
import { RolesValidators } from './validators';
import { authenticate, authorize } from '@middlewares/authUser.middleware';

export class RolesRoutes {
    static get routes(): Router {
        const router = Router();

        const rolesServices = new RolesService();
        const controller = new RolesController(rolesServices);

        router.use(authenticate);

        router.get('/', authorize('SHOW_ALL', 'roles'), controller.getRoles);

        router.get(
            '/:id',
            RolesValidators.getID,
            authorize('SHOW', 'roles'),
            controller.getRole,
        );

        router.post(
            '/',
            RolesValidators.create,
            authorize('create', 'roles'),
            controller.createRole,
        );

        router.put(
            '/:id',
            RolesValidators.update,
            authorize('update', 'roles'),
            controller.updateRole,
        );

        router.delete(
            '/:id',
            RolesValidators.delete,
            authorize('delete', 'roles'),
            controller.deleteRole,
        );

        return router;
    }
}

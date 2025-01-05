import { Router } from 'express';
import { RolesValidators } from './validators';
import { RolesController } from 'src/controllers';
import { RolesService } from 'src/services';

export class RolesRoutes {
    static get routes(): Router {
        const router = Router();

        const rolesServices = new RolesService();
        const controller = new RolesController(rolesServices);

        router.get('/', controller.getRoles);
        router.get('/:id', RolesValidators.getID, controller.getRole);
        router.post('/', RolesValidators.create, controller.createRole);
        router.put('/:id', RolesValidators.update, controller.updateRole);
        router.delete('/:id', RolesValidators.delete, controller.deleteRole);

        return router;
    }
}

import { Router } from 'express';
import { RolesRoutes } from './roles/router';
import { AuthRoutes } from './auth/router';
import { UsersRoutes } from './users/router';

export class AppRoutes {
    static get routes(): Router {
        const router = Router();

        router.use('/auth/', AuthRoutes.routes);
        router.use('/roles/', RolesRoutes.routes);
        router.use('/users/', UsersRoutes.routes);

        return router;
    }
}

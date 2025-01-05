import { Request, Response } from 'express';
import { handleError } from 'src/errors';
import {
    CreateRole,
    DeleteRole,
    GetRole,
    GetRoles,
    UpdateRole,
} from 'src/services/roles/use-cases';
import { CreateRoleDto, UpdateRoleDto } from './dtos';
import { Success } from 'src/helpers';
import { RolesService } from 'src/services';

export class RolesController {
    constructor(private readonly rolesServices: RolesService) {}

    private parseId = (req: Request): number => parseInt(req.params.id);

    public getRoles = (req: Request, res: Response) => {
        new GetRoles(this.rolesServices)
            .execute()
            .then(roles =>
                Success.ok('Roles retrieved successfully', roles).send(res),
            )
            .catch(error => handleError(res, error));
    };

    public createRole = (req: Request, res: Response) => {
        const roleCreateDto = CreateRoleDto.create(req.body);

        new CreateRole(this.rolesServices)
            .execute(roleCreateDto)
            .then(role => Success.created('Role created', role).send(res))
            .catch(error => handleError(res, error));
    };

    public getRole = (req: Request, res: Response) => {
        new GetRole(this.rolesServices)
            .execute(req.params.id)
            .then(role =>
                Success.ok('Role retrieved successfully', role).send(res),
            )
            .catch(error => handleError(res, error));
    };

    public updateRole = (req: Request, res: Response) => {
        const roleUpdateDto = UpdateRoleDto.create(req.params.id, req.body);

        new UpdateRole(this.rolesServices)
            .execute(roleUpdateDto)
            .then(role => Success.ok('Role updated', role).send(res))
            .catch(error => handleError(res, error));
    };

    public deleteRole = (req: Request, res: Response) => {
        new DeleteRole(this.rolesServices)
            .execute(req.params.id)
            .then(() => Success.noContent().send(res))
            .catch(error => handleError(res, error));
    };
}

import { RolesService } from '../roles.service';

export interface DeleteRoleUseCase {
    execute(id: string): Promise<void>;
}

export class DeleteRole implements DeleteRoleUseCase {
    constructor(private readonly service: RolesService) {}

    execute(id: string): Promise<void> {
        return this.service.deleteById(id);
    }
}

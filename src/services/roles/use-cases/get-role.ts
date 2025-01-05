import { RoleEntity } from '../entity';
import { RolesService } from '../roles.service';

export interface GetRoleUseCase {
    execute(id: string): Promise<RoleEntity>;
}

export class GetRole implements GetRoleUseCase {
    constructor(private readonly service: RolesService) {}

    execute(id: string): Promise<RoleEntity> {
        return this.service.findById(id);
    }
}

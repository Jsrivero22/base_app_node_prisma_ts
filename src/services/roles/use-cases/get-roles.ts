import { RoleEntity } from '../entity';
import { RolesService } from '../roles.service';

export interface GetRolesUseCase {
    execute(): Promise<RoleEntity[]>;
}

export class GetRoles implements GetRolesUseCase {
    constructor(private readonly service: RolesService) {}

    execute(): Promise<RoleEntity[]> {
        return this.service.getRoles();
    }
}

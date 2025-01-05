import { CreateRoleDto } from 'src/controllers/roles/dtos';
import { RoleEntity } from '../entity';
import { RolesService } from '../roles.service';

export interface CreateRoleUseCase {
    execute(dto: CreateRoleDto): Promise<RoleEntity>;
}

export class CreateRole implements CreateRoleUseCase {
    constructor(private readonly service: RolesService) {}

    execute(dto: CreateRoleDto): Promise<RoleEntity> {
        return this.service.createRole(dto);
    }
}

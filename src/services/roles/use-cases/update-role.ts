import { UpdateRoleDto } from 'src/controllers/roles/dtos';
import { RoleEntity } from '../entity';
import { RolesService } from '../roles.service';

export interface UpdateRoleUseCase {
    execute(dto: UpdateRoleDto): Promise<RoleEntity>;
}

export class UpdateRole implements UpdateRoleUseCase {
    constructor(private readonly service: RolesService) {}

    execute(dto: UpdateRoleDto): Promise<RoleEntity> {
        return this.service.updateBydId(dto);
    }
}

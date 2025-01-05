import { RolesService } from '../roles.service';

export class AssignRoleToUserUseCase {
    constructor(private readonly service: RolesService) {}

    async execute(userId: string, roleId: string[]): Promise<void> {
        return this.service.assignRoleToUser(userId, roleId);
    }
}

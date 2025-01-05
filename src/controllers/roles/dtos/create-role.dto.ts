import { RoleModel } from '@prisma/client';

export class CreateRoleDto {
    private constructor(
        public readonly name: RoleModel['name'],
        public readonly description: RoleModel['description'],
    ) {}

    static create(props: { [key: string]: any }): CreateRoleDto {
        const { name, description } = props;

        return new CreateRoleDto(name, description);
    }
}

import { RoleModel } from '@prisma/client';

export class UpdateRoleDto {
    private constructor(
        public readonly id: RoleModel['id'],
        public readonly name?: RoleModel['name'],
        public readonly description?: RoleModel['description'],
    ) {}

    static create(
        id: RoleModel['id'],
        props: { [key: string]: any },
    ): UpdateRoleDto {
        const { name, description } = props;

        return new UpdateRoleDto(
            id,
            name?.toUpperCase(),
            description?.toLowerCase(),
        );
    }
}

import { prisma } from '@postgres';
import { RoleEntity } from './entity';
import { CustomError } from 'src/errors/custom.error';
import { CreateRoleDto } from 'src/controllers/roles/dtos/create-role.dto';
import { UpdateRoleDto } from 'src/controllers/roles/dtos';
import { Uuid } from 'src/config/adapters';

export class RolesService {
    private readonly module = 'RolesService';
    private readonly prismaService: typeof prisma = prisma;

    constructor() {}

    async getRoles(): Promise<RoleEntity[]> {
        try {
            const roles = await this.prismaService.roleModel.findMany();

            return RoleEntity.fromArray(roles);
        } catch (error) {
            throw CustomError.internal(
                `Error getting roles: ${error}`,
                this.module,
                'getRoles',
            );
        }
    }

    async createRole(createRoleDto: CreateRoleDto): Promise<RoleEntity> {
        await this.validateRoleExistence(createRoleDto.name);

        try {
            const role = await this.prismaService.roleModel.create({
                data: {
                    ...createRoleDto,
                    id: Uuid.generate(),
                },
            });

            return RoleEntity.fromObject(role);
        } catch (error) {
            throw CustomError.internal(
                `Error creating role: ${error}`,
                this.module,
                'createRole',
            );
        }
    }

    async findById(id: string): Promise<RoleEntity> {
        const role = await this.prismaService.roleModel.findUnique({
            where: { id },
        });

        if (!role) {
            throw CustomError.notFound(
                `Role with id ${id} not found`,
                this.module,
                'findById',
            );
        }

        return RoleEntity.fromObject(role);
    }

    async deleteById(id: string): Promise<void> {
        await this.findById(id);

        try {
            await this.prismaService.roleModel.delete({
                where: { id },
            });
        } catch (error) {
            throw CustomError.internal(
                `Error deleting role: ${error}`,
                this.module,
                'deleteById',
            );
        }
    }

    async updateBydId(updateRoleDto: UpdateRoleDto): Promise<RoleEntity> {
        const { id, ...restRole } = updateRoleDto;

        await this.findById(id);

        try {
            const role = await this.prismaService.roleModel.update({
                data: restRole,
                where: { id },
            });

            console.log(role);
            return RoleEntity.fromObject(role);
        } catch (error) {
            throw CustomError.internal(
                `Error updating role: ${error}`,
                this.module,
                'updateById',
            );
        }
    }

    private async findRoleByName(name: string): Promise<RoleEntity | null> {
        const role = await this.prismaService.roleModel.findUnique({
            where: { name },
        });

        return role ? RoleEntity.fromObject(role) : null;
    }

    async validateRoleExistence(name: string): Promise<void> {
        const role = await this.findRoleByName(name);

        if (role) {
            throw CustomError.conflict(
                `Role with name ${name} already exists`,
                this.module,
                'validateRoleExistence',
            );
        }
    }

    async findByName(name: string): Promise<RoleEntity> {
        const role = await this.findRoleByName(name);

        if (!role) {
            throw CustomError.notFound(
                `Role with name ${name} not found`,
                this.module,
                'findByName',
            );
        }
        return role;
    }

    async findByIds(ids: string[]): Promise<RoleEntity[]> {
        const roles = await this.prismaService.roleModel.findMany({
            where: { id: { in: ids } },
        });

        return RoleEntity.fromArray(roles);
    }

    // async existRoleInUser(userId: string, roleId: string): Promise<boolean> {
    //     const userRole = await this.prismaService.userRoleModel.findUnique({
    //         where: { userId_roleId: { userId, roleId } },
    //     });

    //     return !!userRole;
    // }

    // async existRolesInUser(userId: string, roles: string[]): Promise<boolean> {
    //     const userRoles = await this.prismaService.userRoleModel.findMany({
    //         where: { userId, roleId: { in: roles } },
    //     });

    //     return userRoles.length > 0;
    // }
}

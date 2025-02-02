import { prisma } from '@postgres';
import { RoleEntity } from './entity';
import { CustomError } from 'src/errors/custom.error';
import { CreateRoleDto } from 'src/controllers/roles/dtos/create-role.dto';
import { UpdateRoleDto } from 'src/controllers/roles/dtos';
import { handleServiceError } from 'src/errors';
import { Uuid } from 'src/config/adapters/uuid.adapter';
import { RoleModel } from '@prisma/client';

export class RolesService {
    private readonly module = 'RolesService';
    private readonly prismaService: typeof prisma = prisma;

    constructor() {}

    async getRoles(): Promise<RoleEntity[]> {
        try {
            const roles = await this.prismaService.roleModel.findMany();

            return RoleEntity.fromArray(roles);
        } catch (error) {
            handleServiceError('getRoles', this.module, error);
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
            handleServiceError('createRole', this.module, error);
        }
    }

    async findById(id: RoleModel['id']): Promise<RoleEntity> {
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

    async deleteById(id: RoleModel['id']): Promise<void> {
        await this.findById(id);

        try {
            await this.prismaService.roleModel.delete({
                where: { id },
            });
        } catch (error) {
            handleServiceError('deleteById', this.module, error);
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
            handleServiceError('updateById', this.module, error);
        }
    }

    private async findRoleByName(
        name: RoleModel['name'],
    ): Promise<RoleEntity | null> {
        const role = await this.prismaService.roleModel.findUnique({
            where: { name },
        });

        return role ? RoleEntity.fromObject(role) : null;
    }

    async validateRoleExistence(name: RoleModel['name']): Promise<void> {
        const role = await this.findRoleByName(name);

        if (role) {
            throw CustomError.conflict(
                `Role with name ${name} already exists`,
                this.module,
                'validateRoleExistence',
            );
        }
    }

    async findByName(name: RoleModel['name']): Promise<RoleEntity> {
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

    async findByIds(ids: RoleModel['id'][]): Promise<RoleEntity[]> {
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

    async findByUserId(userId: string): Promise<RoleEntity[]> {
        const userRoles = await this.prismaService.roleModel.findMany({
            where: { users: { some: { id: userId } } },
        });

        return RoleEntity.fromArray(userRoles);
    }
}

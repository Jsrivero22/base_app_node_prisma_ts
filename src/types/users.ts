import { Prisma, RoleModel, UserModel } from '@prisma/client';

export type UserWithDynamicRelations<T extends Prisma.UserModelInclude> =
    Prisma.UserModelGetPayload<{
        include: T;
    }>;

export interface UserWithRoles extends UserModel {
    roles: (RoleModel & {
        roleModulePermissions: {
            permission: {
                permissionType: {
                    name: string;
                };
                module: {
                    name: string;
                };
            };
        }[];
    })[];
}

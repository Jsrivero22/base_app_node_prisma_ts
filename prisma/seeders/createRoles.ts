import { ModuleModel } from '@prisma/client';
import { prisma } from '../../src/data/postgres';
import { Uuid } from '../../src/config/adapters/uuid.adapter';

type PermissionsMap = Record<string, string>; // Mapa de permisos
type Modules = {
    usersModule: ModuleModel;
    rolesModule: ModuleModel;
};

// Función para crear roles con permisos
export async function createRoles(
    permissionsMap: PermissionsMap,
    modules: Modules,
) {
    const createRoleWithPermissions = async (
        name: string,
        description: string,
        modulePermissions: Record<string, string[]>, // Cambiamos a usar el tipo específico
    ) => {
        return prisma.roleModel.create({
            data: {
                id: Uuid.generate(),
                name,
                description,
                roleModulePermissions: {
                    create: Object.entries(modulePermissions).flatMap(
                        ([moduleId, permissions]) =>
                            permissions.map(permission => {
                                // Ahora usamos el mapa de permisos que incluye el ID del módulo
                                const permissionId =
                                    permissionsMap[`${permission}_${moduleId}`];
                                return {
                                    id: Uuid.generate(),
                                    permission: {
                                        connect: { id: permissionId }, // Conecta el permiso usando el ID correcto
                                    },
                                    module: { connect: { id: moduleId } }, // Conecta el módulo
                                };
                            }),
                    ),
                },
            },
        });
    };

    // Define todos los permisos que se asignarán a los roles
    const allPermissionsInRoles = [
        'ALL_DATA',
        'READ',
        'CREATE',
        'UPDATE',
        'DELETE',
        'SHOW_ALL',
        'SHOW',
    ];

    // Crea el rol de administrador
    const adminRole = await createRoleWithPermissions(
        'ADMIN',
        'Administrator role',
        {
            [modules.usersModule.id]: allPermissionsInRoles,
            [modules.rolesModule.id]: allPermissionsInRoles,
        },
    );

    // Crea el rol de usuario
    const userRole = await createRoleWithPermissions('USER', 'User role', {
        [modules.usersModule.id]: allPermissionsInRoles,
        [modules.rolesModule.id]: allPermissionsInRoles,
    });

    return { adminRole, userRole }; // Devuelve los roles creados
}

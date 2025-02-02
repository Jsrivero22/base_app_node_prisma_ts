import { prisma } from '../../src/data/postgres';
import { Uuid } from '../../src/config/adapters/uuid.adapter';

// Definición de los tipos de permisos
const allPermissionTypes = [
    {
        id: Uuid.generate(),
        name: 'ALL_DATA',
        description: 'Allows all actions',
    },
    { id: Uuid.generate(), name: 'READ', description: 'Allows reading data' },
    {
        id: Uuid.generate(),
        name: 'CREATE',
        description: 'Allows creating data',
    },
    {
        id: Uuid.generate(),
        name: 'UPDATE',
        description: 'Allows updating data',
    },
    {
        id: Uuid.generate(),
        name: 'DELETE',
        description: 'Allows deleting data',
    },
    {
        id: Uuid.generate(),
        name: 'SHOW_ALL',
        description: 'Allows showing all data',
    },
    {
        id: Uuid.generate(),
        name: 'SHOW',
        description: 'Allows showing data',
    },
];

// Función para crear permisos y tipos de permisos
export async function createPermissions() {
    // Crea tipos de permisos
    await prisma.permissionTypeModel.createMany({
        data: allPermissionTypes,
    });

    // Obtiene todos los tipos de permisos de la base de datos
    const permissionTypes = await prisma.permissionTypeModel.findMany();

    // Crea módulos para asociar permisos (debes asegurarte de que los módulos ya estén creados)
    const modules = await prisma.moduleModel.findMany();

    // Crea permisos para cada combinación de tipo de permiso y módulo
    const permissionsData: {
        id: string;
        permissionTypeId: string;
        moduleId: string;
        description: string;
    }[] = [];
    for (const module of modules) {
        for (const type of permissionTypes) {
            permissionsData.push({
                id: Uuid.generate(),
                permissionTypeId: type.id,
                moduleId: module.id,
                description: `Allows ${type.name.toUpperCase()} operation for module ${module.name.toUpperCase()}`,
            });
        }
    }

    // Crear permisos en la base de datos
    await prisma.permissionModel.createMany({ data: permissionsData });

    // Obtiene todos los permisos de la base de datos
    const permissions = await prisma.permissionModel.findMany();

    // Crea un mapa de tipos de permisos a IDs de permisos
    const permissionsMap = permissions.reduce<Record<string, string>>(
        (acc, permission) => {
            const type = permissionTypes.find(
                type => type.id === permission.permissionTypeId,
            );
            if (type) {
                acc[`${type.name}_${permission.moduleId}`] = permission.id; // Se usa el nombre del tipo y el ID del módulo para asegurar unicidad
            }
            return acc;
        },
        {},
    );

    return permissionsMap; // Devuelve el mapa de permisos
}

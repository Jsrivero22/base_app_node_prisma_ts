import { prisma } from '../../src/data/postgres';

export async function clearDatabase() {
    // await prisma.userRoleModel.deleteMany();
    await prisma.rolePermissionModuleModel.deleteMany();
    await prisma.userModel.deleteMany();
    await prisma.roleModel.deleteMany();
    await prisma.permissionModel.deleteMany();
    await prisma.moduleModel.deleteMany();
    await prisma.permissionTypeModel.deleteMany();

    // await prisma.$executeRawUnsafe('TRUNCATE "UserRole"');
    // await prisma.$executeRawUnsafe('TRUNCATE "RolePermission"');
    // await prisma.$executeRawUnsafe('TRUNCATE "User"');
    // await prisma.$executeRawUnsafe('TRUNCATE "Role"');
    // await prisma.$executeRawUnsafe('TRUNCATE "Permission"');
    // await prisma.$executeRawUnsafe('TRUNCATE "Module"');
}

import { prisma } from '../../src/data/postgres';
import { clearDatabase } from './clearDatabase';
import { createModules } from './createModules';
import { createPermissions } from './createPermissions';
import { createRoles } from './createRoles';
import { createUsers } from './createUsers';

async function main() {
    await clearDatabase();

    const modules = await createModules();
    const permissionsMap = await createPermissions();
    const roles = await createRoles(permissionsMap, {
        usersModule: modules.users,
        rolesModule: modules.roles,
    });

    await createUsers(roles.adminRole.id);
    // await createUsers(roles.userRole.id);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

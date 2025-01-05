import { Uuid } from '../../src/config/adapters';
import { prisma } from '../../src/data/postgres';

export async function createModules() {
    // Define the modules data
    const modulesData: { id: string; name: string; description: string }[] = [
        {
            id: Uuid.generate(),
            name: 'auth',
            description: 'Module for authentication',
        },
        {
            id: Uuid.generate(),
            name: 'users',
            description: 'Module for managing users',
        },
        {
            id: Uuid.generate(),
            name: 'roles',
            description: 'Module for managing roles',
        },
    ];

    // Create all modules recent defined
    await prisma.moduleModel.createMany({ data: modulesData });

    // get all modules from the database
    const modules = await prisma.moduleModel.findMany();

    // Reorganize the modules array to an object
    return modules.reduce<Record<string, any>>(
        (acc, module) => {
            acc[module.name] = module;
            return acc;
        },
        {} as Record<string, any>,
    );
}

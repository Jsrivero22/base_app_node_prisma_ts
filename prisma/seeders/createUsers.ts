import { prisma } from '../../src/data/postgres';
import { EncryptedAdapter, Uuid } from '../../src/config/adapters';
import { UserType } from '@prisma/client';

export async function createUsers(id: string) {
    await prisma.userModel.create({
        data: {
            id: Uuid.generate(),
            name: 'Antonio',
            lastName: 'Salcedo',
            email: 'antoniosalcedo22@hotmail.com',
            password: EncryptedAdapter.encrypt('Qwerty123456!!'),
            roles: { connect: { id } },
            emailVerified: true,
            userType: UserType.ROOT,
        },
    });
}

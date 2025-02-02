import { Uuid } from '../../src/config/adapters/uuid.adapter';
import { prisma } from '../../src/data/postgres';
import { UserType } from '@prisma/client';
import { EncryptedAdapter } from '../../src/config/adapters/bcrypt.adapter';

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

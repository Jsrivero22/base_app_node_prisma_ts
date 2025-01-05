import { UserModel, UserType } from '@prisma/client';
import { RoleEntity } from '../roles/entity';

export type RoleUser = { id: string; name: string };

export class UserEntity {
    constructor(
        public id: UserModel['id'],
        public name: UserModel['name'],
        public lastName: UserModel['lastName'],
        public email: UserModel['email'],
        public emailVerified: UserModel['emailVerified'],
        // public emailVerificationToken: UserModel['emailVerificationToken'],
        public userType: UserType,
        public avatar: UserModel['avatar'],
        public tokenSession: string,
        public roles?: RoleEntity[],
    ) {}

    // public hasRole(id: string): boolean {
    //     return this.roles.some(role => role.id === id);
    // }

    // public isAdmin(id: string): boolean {
    //     return this.roles.some(
    //         role => role.id === id && role.name === RoleType.ADMIN,
    //     );
    // }

    public static fromObject(object: { [key: string]: any }): UserEntity {
        const {
            id,
            name,
            lastName,
            email,
            emailVerified,
            // emailVerificationToken,
            userType,
            avatar,
            tokenSession,
            roles = [],
        } = object;

        const rolesFrom = RoleEntity.fromArray(roles);

        return new UserEntity(
            id,
            name,
            lastName,
            email,
            emailVerified,
            // emailVerificationToken,
            userType,
            avatar,
            tokenSession,
            rolesFrom,
        );
    }

    public static fromArray(array: { [key: string]: any }[]): UserEntity[] {
        return array.map(UserEntity.fromObject);
    }
}

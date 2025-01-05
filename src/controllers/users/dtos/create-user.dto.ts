import { RoleModel, UserModel, UserType } from '@prisma/client';

export class CreateUserDto {
    private constructor(
        public readonly name: UserModel['name'],
        public readonly lastName: UserModel['lastName'],
        public readonly email: UserModel['email'],
        public readonly password: UserModel['password'],
        public roles: RoleModel['id'][],
        public readonly avatar: UserModel['avatar'],
        public readonly userType?: UserType,
    ) {}

    static create(props: { [key: string]: any }): CreateUserDto {
        const {
            name,
            lastName,
            email,
            password,
            roles = [],
            avatar,
            userType,
        } = props;

        return new CreateUserDto(
            name,
            lastName,
            email,
            password,
            roles,
            avatar,
            userType,
        );
    }
}

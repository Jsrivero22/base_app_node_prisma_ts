import { UserModel } from '@prisma/client';

export class LoginUserDto {
    constructor(
        public readonly email: UserModel['email'],
        public readonly password: UserModel['password'],
    ) {}

    static create(props: { [key: string]: any }) {
        const { email, password } = props;

        return new LoginUserDto(email, password);
    }
}

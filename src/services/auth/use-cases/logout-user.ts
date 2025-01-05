import { UserModel } from '@prisma/client';
import { UsersService } from 'src/services/users/users.service';

interface LogoutUser {
    execute(email: UserModel['email']): Promise<void>;
}

export class LogoutUserUseCase implements LogoutUser {
    private readonly module = 'LogoutUserUseCase';

    constructor(private readonly userService: UsersService) {}

    async execute(idUser: UserModel['id']): Promise<void> {
        const user = await this.userService.findById(idUser);

        await this.userService.updateUserById(user.id, {
            tokenSession: null,
        });
    }
}

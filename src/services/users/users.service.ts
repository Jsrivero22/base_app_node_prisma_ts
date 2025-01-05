import { prisma } from '@postgres';
import { CreateUserDto } from 'src/controllers/users/dtos';
import { CustomError } from 'src/errors/custom.error';
import { UserEntity } from './entity';
import { EncryptedAdapter, JWT, Uuid } from 'src/config/adapters';
import { Status, UserModel, UserType } from '@prisma/client';
import { ExpiryDateGenerator } from 'src/utils/expiryDateGenerator';

export class UsersService {
    private readonly module = 'UsersService';
    private readonly prismaService: typeof prisma = prisma;

    constructor() {}

    async createUser(createUserDto: CreateUserDto): Promise<UserModel> {
        const { roles, password, ...userData } = createUserDto;
        const id: string = Uuid.generate();
        const userType = userData.userType ?? UserType.USER;
        const emailVerificationToken: string = JWT.tokenSign(
            { id, status: Status.ACTIVE, userType },
            '30m',
        );
        const tokenExpiry = ExpiryDateGenerator.fromMinutes(30);

        try {
            const user = await this.prismaService.$transaction(async prisma => {
                return prisma.userModel.create({
                    data: {
                        ...userData,
                        id,
                        password: EncryptedAdapter.encrypt(password),
                        emailVerificationToken,
                        emailVerificationTokenExpiry: tokenExpiry,
                        roles: {
                            connect: roles.map(roleId => ({ id: roleId })),
                        },
                    },
                    include: { roles: true },
                });
            });

            return user;
        } catch (error) {
            throw CustomError.internal(
                `Error creating user: ${error}`,
                this.module,
                'createUser',
            );
        }
    }

    async updateUserById(id: UserModel['id'], userData: Partial<UserModel>) {
        try {
            const user = await this.prismaService.userModel.update({
                where: { id },
                data: userData,
            });

            return UserEntity.fromObject(user);
        } catch (error) {
            throw CustomError.internal(
                `Error updating user: ${error}`,
                this.module,
                'updateUserById',
            );
        }
    }

    async findById(id: UserModel['id']): Promise<UserModel> {
        try {
            const user = await this.prismaService.userModel.findUnique({
                where: { id },
                include: { roles: true },
            });

            if (!user) {
                throw CustomError.notFound(
                    `User with id ${id} not found`,
                    this.module,
                    'findById',
                );
            }

            return user;
        } catch (error) {
            throw CustomError.internal(
                `Error finding user: ${error}`,
                this.module,
                'findById',
            );
        }
    }

    async findByEmail(email: UserModel['email']): Promise<UserModel> {
        try {
            const user = await this.prismaService.userModel.findUnique({
                where: { email },
            });

            if (!user) {
                throw CustomError.notFound(
                    'User or password incorrect',
                    this.module,
                    'execute',
                );
            }

            return user;
        } catch (error) {
            throw CustomError.internal(
                `Error finding user: ${error}`,
                this.module,
                'findByEmail',
            );
        }
    }

    async validateExistingEmail(email: UserModel['email']): Promise<void> {
        try {
            const user = await this.prismaService.userModel.findUnique({
                where: { email },
            });

            if (user) {
                throw CustomError.conflict(
                    `User with email ${email} already exists`,
                    this.module,
                    'validateExistingEmail',
                );
            }
        } catch (error) {
            throw CustomError.internal(
                `Error validating email: ${error}`,
                this.module,
                'validateExistingEmail',
            );
        }
    }
}

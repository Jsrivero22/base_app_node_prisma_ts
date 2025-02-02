import { prisma } from '@postgres';
import { CreateUserDto } from 'src/controllers/users/dtos';
import { CustomError } from 'src/errors/custom.error';
import { UserEntity } from './entity';
import { Prisma, Status, UserModel } from '@prisma/client';
import { ExpiryDateGenerator } from 'src/utils/expiryDateGenerator';
import { handleServiceError } from 'src/errors';
import { Uuid } from 'src/config/adapters/uuid.adapter';
import { EncryptedAdapter } from 'src/config/adapters/bcrypt.adapter';
import { JWT } from 'src/config/adapters/jwt.adapter';
import { UserWithRoles } from 'src/types/users';

export class UsersService {
    private readonly module = 'UsersService';
    private readonly prismaService: typeof prisma = prisma;

    constructor() {}

    async createUser(createUserDto: CreateUserDto): Promise<UserModel> {
        const { roles, password, ...userData } = createUserDto;
        const id: string = Uuid.generate();
        const emailVerificationToken: string = JWT.tokenSign(
            { id, status: Status.ACTIVE, roles: roles.map(roleId => roleId) },
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
                    include: { roles: { select: { id: true, name: true } } },
                });
            });

            return user;
        } catch (error) {
            handleServiceError('createUser', this.module, error);
        }
    }

    async updateUserById(
        id: UserModel['id'],
        userData: Partial<UserModel>,
        includeOptions?: Prisma.UserModelInclude,
    ): Promise<UserEntity> {
        try {
            const user = await this.prismaService.userModel.update({
                where: { id },
                data: userData,
                include: includeOptions,
            });

            return UserEntity.fromObject(user);
        } catch (error) {
            handleServiceError('updateUserById', this.module, error);
        }
    }

    async findById(
        id: UserModel['id'],
        includeOptions?: Prisma.UserModelInclude,
    ): Promise<UserModel> {
        try {
            const user = await this.prismaService.userModel.findUnique({
                where: { id },
                include: includeOptions,
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
            handleServiceError('findById', this.module, error);
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
            handleServiceError('findByEmail', this.module, error);
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
            handleServiceError('validateExistingEmail', this.module, error);
        }
    }

    async findUserWithRolesAndPermissions(
        id: UserModel['id'],
    ): Promise<UserWithRoles> {
        try {
            const user = await this.prismaService.userModel.findUnique({
                where: { id },
                include: {
                    roles: {
                        select: {
                            name: true,
                            roleModulePermissions: {
                                select: {
                                    permission: {
                                        select: {
                                            permissionType: {
                                                select: { name: true },
                                            },
                                            module: { select: { name: true } },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            if (!user) {
                throw CustomError.notFound(
                    `User with id ${id} not found`,
                    this.module,
                    'findUserWithRolesAndPermissions',
                );
            }

            return user as UserWithRoles;
        } catch (error) {
            handleServiceError(
                'findUserWithRolesAndPermissions',
                this.module,
                error,
            );
        }
    }
}

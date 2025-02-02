import { RoleModel } from '@prisma/client';

export type DraftTokenType = {
    id: string;
    status: string;
    roles: RoleModel['id'][];
};

export type TokenType = {
    id: string;
    status: string;
    roles: RoleModel['id'][];
};

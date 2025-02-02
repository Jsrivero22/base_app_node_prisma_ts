export interface UserPermissions {
    id: string;
    roles: string[];
    permissions: {
        permission: string;
        module: string;
    }[];
}

declare module 'express' {
    interface Request {
        user?: UserPermissions;
    }
}

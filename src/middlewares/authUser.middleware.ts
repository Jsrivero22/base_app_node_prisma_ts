import { AuthService, UsersService } from '@services/index';
import { Request, Response, NextFunction } from 'express';
import { CustomError } from 'src/errors/custom.error';

declare module 'express' {
    interface Request {
        user?: {
            id: string;
            roles: string[];
            permissions: {
                permission: string;
                module: string;
            }[];
        };
    }
}

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw CustomError.unauthorized('No token provided');
        }

        const userService = new UsersService();
        const authService = new AuthService(userService);
        req.user = await authService.authenticate(token);

        next();
    } catch (error: any) {
        next(CustomError.unauthorized('Invalid token: ' + error.message));
    }
};

export const authorize = (requiredPermission: string, module: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw CustomError.unauthorized('User not authenticated');
            }

            const userService = new UsersService();
            const authService = new AuthService(userService);
            if (
                !authService.hasPermission(req.user, requiredPermission, module)
            ) {
                throw CustomError.forbidden('Insufficient permissions');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

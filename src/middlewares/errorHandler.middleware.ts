// src/middlewares/errorHandler.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { CustomError } from 'src/errors/custom.error';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    if (err instanceof CustomError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            service: err.service,
            method: err.method,
        });
    }

    return res.status(500).json({
        success: false,
        message: 'Internal server error, contact the administrator',
    });

    next();
};
